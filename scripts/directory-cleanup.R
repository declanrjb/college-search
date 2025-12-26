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

write.csv(df, 'data/directory.csv', row.names=FALSE)


