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