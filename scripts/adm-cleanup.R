library(tidyverse)
source('scripts/functions.R')

adm_files <- list.files('data/raw/ipeds/ipeds-clean/admissions', full.names=TRUE)

directory <- read_csv('data/raw/ipeds/HD2024.csv')

directory <- directory |>
  select(UNITID, INSTNM) |>
  rename(NAME = INSTNM)

# basic admission stats

# bind in the adm files for individual years, selecting relevant columns
df <- adm_files |>
  lapply(function(file) {
    read_csv(file) |>
      mutate(YEAR = str_extract(file, '[0-9]+')) |>
      select(YEAR, UNITID, APPLCN, ADMSSN, ENRLT)
  }) %>%
  do.call(rbind, .)

df <- df |>
  arrange(UNITID, desc(YEAR))

df <- df |>
  mutate(ADM_RATE = ADMSSN / APPLCN,
          YIELD = ENRLT / ADMSSN)

df |>
  rename(
    APPLIED = APPLCN,
    ADMITTED = ADMSSN,
    ENROLLED = ENRLT
  ) |>
  left_join(directory) |>
  select(YEAR, NAME, UNITID, APPLIED, ADMITTED, ENROLLED, ADM_RATE, YIELD) |>
  write.csv('data/tidy/admissions.csv', row.names=FALSE)

df <- df |>
  mutate(ADM_RATE = round(ADM_RATE * 100, digits=1), YIELD = round(YIELD * 100, digits=1)) |>
  mutate(ADM_RATE = paste(ADM_RATE, '%', sep=''), YIELD = paste(YIELD, '%', sep='')) |>
  rename(
    Year = YEAR,
    Applicants = APPLCN,
    Admitted = ADMSSN,
    Enrolled = ENRLT,
    `Admission Rate` = ADM_RATE,
    Yield = YIELD
  )

write.csv(df, 'data/admissions.csv', row.names=FALSE)


