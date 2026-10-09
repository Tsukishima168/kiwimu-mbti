# Local fixture only: fixed loopback port/user/database, no production env credentials.
import subprocess, concurrent.futures, uuid, os, json
base=['psql','-h','127.0.0.1','-p','56379','-U','codex_quiz_test','-d','kiwimu_quiz_notifications_test','-At','-v','ON_ERROR_STOP=1','-c']
env={k:v for k,v in os.environ.items() if not k.startswith('PG')}
def query(sql):
 p=subprocess.run(base+[sql],capture_output=True,text=True,env=env)
 if p.returncode: raise RuntimeError(p.stderr)
 return p.stdout.strip()
assert query("SELECT current_database() || '/' || current_user")=='kiwimu_quiz_notifications_test/codex_quiz_test'
def reset(): query('TRUNCATE public.quiz_completion_notifications, public.quiz_notification_budgets')
def claim(completion,client='a'*64,evidence='b'*64):
 return json.loads(query("SELECT public.claim_quiz_completion_notification('%s','%s','%s')"%(completion,evidence,client)))['status']
results=[]
reset(); cid=str(uuid.uuid4())
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 states=list(pool.map(lambda _:claim(cid),range(10)))
assert states.count('claimed')==1 and states.count('retry')==9,states
assert query("SELECT used FROM public.quiz_notification_budgets WHERE bucket='global'")=='1'
assert claim(cid,evidence='c'*64)=='conflict'
results.append('Concurrent replay: one claim, nine nonterminal in-progress retries, one quota charge; altered evidence conflicts.')
reset()
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 states=list(pool.map(lambda _:claim(str(uuid.uuid4())),range(30)))
assert states.count('claimed')==12 and states.count('limited')==18,states
results.append('Concurrent IP limit: 12 allowed, 18 limited; no extra reservations.')
reset()
values=query("SELECT public.claim_quiz_completion_notification(md5(i::text)::uuid, repeat(md5(i::text),2), repeat(md5(('client'||i)::text),2)) FROM generate_series(1,601) i").splitlines()
values=[json.loads(item)['status'] for item in values]
assert values.count('claimed')==600 and values[-1]=='limited'
assert query('SELECT count(*) FROM public.quiz_completion_notifications')=='600'
results.append('Global hourly cap: 600 allowed; completion 601 limited across distinct client hashes.')
assert query("SELECT has_function_privilege('anon','public.claim_quiz_completion_notification(uuid,text,text)','execute'),has_function_privilege('authenticated','public.claim_quiz_completion_notification(uuid,text,text)','execute'),has_function_privilege('service_role','public.claim_quiz_completion_notification(uuid,text,text)','execute')")=='f|f|t'
for role in ['anon','authenticated']:
 for table in ['quiz_completion_notifications','quiz_notification_budgets']:
  assert query("SELECT has_table_privilege('%s','public.%s','SELECT,INSERT,UPDATE,DELETE')"%(role,table))=='f'
assert query("SELECT bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_class WHERE relname IN ('quiz_completion_notifications','quiz_notification_budgets')")=='t'
results.append('Permissions: anon/authenticated cannot read/write tables or execute RPC; both tables RLS+FORCE.')
reset();cid=str(uuid.uuid4());state=query("SET ROLE service_role; SELECT public.claim_quiz_completion_notification('%s','%s','%s'); UPDATE public.quiz_completion_notifications SET status='sent' WHERE completion_id='%s'; RESET ROLE;"%(cid,'a'*64,'b'*64,cid))
assert 'claimed' in state and 'UPDATE 1' in state
assert claim(cid,client='b'*64,evidence='a'*64)=='duplicate'
query("UPDATE public.quiz_notification_budgets SET window_start=now()-interval '2 hours'")
assert claim(str(uuid.uuid4()))=='claimed'
assert query("SELECT max(used) FROM public.quiz_notification_budgets")=='1'
assert claim(cid,client='b'*64,evidence='a'*64)=='duplicate'
results.append('Actual service_role can reserve/update; expired rate keys reset while old IDs remain replay-proof.')
cid2=str(uuid.uuid4()); claim(cid2)
query("UPDATE public.quiz_completion_notifications SET status='retry',delivered_channels=ARRAY['1466020032310939823'],retry_at=now()+interval '60 seconds' WHERE completion_id='%s'"%cid2)
waiting=json.loads(query("SELECT public.claim_quiz_completion_notification('%s','%s','%s')"%(cid2,'b'*64,'a'*64)))
assert waiting['status']=='retry' and 1<=waiting['retryAfter']<=60
used=query("SELECT used FROM public.quiz_notification_budgets WHERE bucket='global'")
query("UPDATE public.quiz_completion_notifications SET retry_at=now()-interval '1 second' WHERE completion_id='%s'"%cid2)
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 states=list(pool.map(lambda _:json.loads(query("SELECT public.claim_quiz_completion_notification('%s','%s','%s')"%(cid2,'b'*64,'a'*64))),range(10)))
assert sum(item['status']=='claimed' for item in states)==1
assert all(item['deliveredChannels']==['1466020032310939823'] for item in states if item['status']=='claimed')
assert query("SELECT used FROM public.quiz_notification_budgets WHERE bucket='global'")==used
results.append('Provider 429 retry waits until retry_at; exactly one concurrent re-claim, accepted channel preserved, no extra quota.')
print(json.dumps({'checks':results,'production_access':False},ensure_ascii=False,indent=2))
