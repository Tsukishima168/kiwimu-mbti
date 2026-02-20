# MBTI 人格 32 色對照表

**用途**：16 型 × A/T 的人格色，用於角色插畫背後背景色塊。  
**規則**：A 較飽和/堅定，T 較柔/霧。

---

## 一、哪裡看／下載

- **本檔案**：專案內 `docs/MBTI_32_COLOR_REFERENCE.md`（你現在看的這份）
- **原始出處**：同一套顏色也寫在 `metadata.json` 的 description 裡（整段任務說明中）

沒有單獨「下載連結」，顏色表就在這個 repo 的 `docs/` 底下，clone 或 pull 專案後直接開這個檔案即可。

---

## 二、32 色對照表（Hex）

| 類型 | A（堅定） | T（動盪） |
|------|-----------|-----------|
| **INTJ** | `#1D2A6D` | `#4B5AA6` |
| **INTP** | `#274C77` | `#5B84B1` |
| **ENTJ** | `#3B145F` | `#6F4A8E` |
| **ENTP** | `#006D77` | `#3BA7A5` |
| **INFJ** | `#0B3C49` | `#3E6C75` |
| **INFP** | `#2D6A4F` | `#74A58B` |
| **ENFJ** | `#1B998B` | `#65C2B6` |
| **ENFP** | `#FF6B6B` | `#FF9A9A` |
| **ISTJ** | `#2F3E46` | `#6C7A80` |
| **ISFJ** | `#6B705C` | `#A3A68B` |
| **ESTJ** | `#7B2C2C` | `#B06A6A` |
| **ESFJ** | `#C06C84` | `#E0A1B2` |
| **ISTP** | `#3A506B` | `#7C91A8` |
| **ISFP** | `#9A4C95` | `#C28CBD` |
| **ESTP** | `#F77F00` | `#F9A552` |
| **ESFP** | `#FFD166` | `#FFE3A3` |

---

## 三、JSON 格式（複製用）

```json
{
  "INTJ-A": "#1D2A6D", "INTJ-T": "#4B5AA6",
  "INTP-A": "#274C77", "INTP-T": "#5B84B1",
  "ENTJ-A": "#3B145F", "ENTJ-T": "#6F4A8E",
  "ENTP-A": "#006D77", "ENTP-T": "#3BA7A5",
  "INFJ-A": "#0B3C49", "INFJ-T": "#3E6C75",
  "INFP-A": "#2D6A4F", "INFP-T": "#74A58B",
  "ENFJ-A": "#1B998B", "ENFJ-T": "#65C2B6",
  "ENFP-A": "#FF6B6B", "ENFP-T": "#FF9A9A",
  "ISTJ-A": "#2F3E46", "ISTJ-T": "#6C7A80",
  "ISFJ-A": "#6B705C", "ISFJ-T": "#A3A68B",
  "ESTJ-A": "#7B2C2C", "ESTJ-T": "#B06A6A",
  "ESFJ-A": "#C06C84", "ESFJ-T": "#E0A1B2",
  "ISTP-A": "#3A506B", "ISTP-T": "#7C91A8",
  "ISFP-A": "#9A4C95", "ISFP-T": "#C28CBD",
  "ESTP-A": "#F77F00", "ESTP-T": "#F9A552",
  "ESFP-A": "#FFD166", "ESFP-T": "#FFE3A3"
}
```

---

**備註**：目前程式裡 `constants.ts` 的 `MBTI_BG_COLORS` 是「16 型、每型一色」的簡化版（NT/NF/SJ/SP 四組淺色），若要做 32 色（含 A/T）需另建對照或擴充該常數。
