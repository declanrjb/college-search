library(tidyverse)

apply_codetable <- function(df, codetable, exempt_columns) {
  for (j in 1:length(colnames(df))) {
    column <- colnames(df)[j]
    if ((column %in% codetable$VarName) & !(column %in% exempt_columns)) {
      replacement_table <- codetable |>
        filter(VarName == column) |>
        select(CodeValue, ValueLabel)

      for (i in 1:length(replacement_table$CodeValue)) {
        temp_func <- function(val) {
          if (val == replacement_table[i,]$CodeValue) {
            return(replacement_table[i,]$ValueLabel)
          } else {
            return(val)
          }
        }
        df[[{{column}}]] <- df[[{{column}}]] |>
          lapply(temp_func) |>
          unlist()
      }
    }
  }
  
  return(df)
}

df <- read_csv('data/HD2024.csv')

df <- df |>
  select(UNITID, INSTNM, WEBADDR, 
    CITY, STABBR, LOCALE,
    CHFNM, CHFTITLE, 
    SECTOR, ICLEVEL, CONTROL, INSTSIZE, HBCU, 
    UGOFFER, GROFFER, HDEGOFR1)

codetable <- read_csv('data/hd2024/symbol-values.csv')

df <- df |>
  apply_codetable(codetable, c('HBCU', 'UGOFFER', 'GROFFER', 'HDEGOFR1'))

df$SECTOR <- df$SECTOR |>
  str_to_lower() |>
  str_replace('or above', '') |>
  str_trim()

df$hbcu_label <- df$HBCU |>
  str_replace("1", 'The institution is considered an HBCU.') |>
  str_replace("2", ' ')

df$UGOFFER <- df$UGOFFER |>
  lapply(function(val) {
    if (val == 1) {
      return(1)
    } else {
      return(0)
    }
  }) |>
  unlist()

df$GROFFER <- df$GROFFER |>
  lapply(function(val) {
    if (val == 1) {
      return(9)
    } else {
      return(0)
    }
  }) |>
  unlist()

df$degrees <- df$UGOFFER + df$GROFFER

df$degrees <- df$degrees |>
    str_replace("10", "undergraduate and graduate") |>
  str_replace("1", "undergraduate") |>
  str_replace("9", "graduate")

df$LOCALE <- df$LOCALE |>
  lapply(function(temp) {
    temp |>
      str_split(":") |> 
      unlist() |> 
      rev() |> 
      paste(collapse=' ') |> 
      str_to_lower() |> 
      str_trim()
  }) |>
  unlist()

write.csv(df, 'data/directory.csv', row.names=FALSE)


