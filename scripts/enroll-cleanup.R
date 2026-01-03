library(tidyverse)
source('scripts/functions.R')

read_enroll_file <- function(file) {
  temp <- read_csv(file) |>
    mutate(YEAR = str_extract(file, '[0-9]+'))
  
  colnames(temp) <- colnames(temp) |>
    str_to_upper()
  
  temp <- temp |>
    select(UNITID, YEAR, EFFYLEV, ends_with('T')) |>
    select(!starts_with('X'))

  if (dim(temp)[2] == 14) {
    return(temp)
  }
}

enroll_files <- list.files('data/ipeds-clean/enrollment', full.names=TRUE)

df <- enroll_files |>
  lapply(read_enroll_file) %>%
  do.call(rbind, .)

# select subgroup all students total
df <- df |>
  filter(EFFYLEV == 1) |>
  select(!EFFYLEV)

enr_codebook <- read_csv('data/vars/effy_vars.csv')

df <- df |>
  pivot_longer(cols=starts_with('E'), names_to='demo') |>
  left_join(
    enr_codebook |>
      select(varName, varTitle),
    by=c('demo' = 'varName')
  ) |>
  select(!demo) |>
  rename(demo = varTitle)

df <- df |>
  rename(students = value)

total_students <- df |>
  filter(demo == 'Grand total') |>
  select(!demo) |>
  arrange(UNITID, desc(YEAR)) |>
  rename(`Total Students` = students)

demographics <- df |>
  filter(YEAR == 2024) |>
  select(!YEAR) |>
  arrange(UNITID) |>
  filter(demo != 'Grand total') |>
  rename(
    Students = students,
    Demographic = demo
  )

total_students |>
  write.csv('data/enroll-total.csv', row.names=FALSE)

demographics |>
  write.csv('data/demographics.csv', row.names=FALSE)