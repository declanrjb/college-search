library(plyr)
library(tidyverse)
source('scripts/functions.R')

read_enroll_file <- function(file) {
  temp <- read_csv(file) |>
    mutate(YEAR = str_extract(file, '[0-9]+'))
  
  colnames(temp) <- colnames(temp) |>
    str_to_upper()

  temp <- temp |>
      select(UNITID, YEAR, EFFYLEV, EFYTOTLM, EFYTOTLW, ends_with('T')) |>
      select(!starts_with('X'))

  if (dim(temp)[2] <= 17) {
    return(temp)
  }
}

enroll_files <- list.files('data/ipeds-clean/enrollment', full.names=TRUE)

df <- enroll_files |>
  lapply(read_enroll_file) %>%
  do.call(rbind.fill, .) |>
  mutate(YEAR = parse_number(YEAR))

# select subgroup all students total
grad_tables <- df |>
  select(UNITID, YEAR, EFFYLEV, EFYTOTLT) |>
  mutate(EFFYLEV = case_when(
    EFFYLEV == 1 ~ 'total',
    EFFYLEV == 2 ~ 'undergraduate',
    EFFYLEV == 4 ~ 'graduate'
  )) |>
  filter(!is.na(EFFYLEV)) |>
  pivot_wider(id_cols=c('UNITID', 'YEAR'), names_from='EFFYLEV', values_from='EFYTOTLT') |>
  mutate(
    graduate = replace_na(graduate, 0),
    undergraduate = replace_na(undergraduate, 0)
  )

# NEED TO CHECK THESE YEARS LINE UP
adm_data <- read_csv('data/admissions.csv')

adm_data <- adm_data |>
  select(Year, UNITID, Enrolled) |>
  rename(first_year = Enrolled)

grad_tables <- grad_tables |>
  left_join(adm_data, by=c('YEAR' = 'Year', 'UNITID'))

# weird that there are 45 colleges with more first years than total students, check that
grad_tables |>
  mutate(
    grad_undergrad_add_up = total == undergraduate + graduate,
    first_years_under_total = first_year <= total
  ) |>
  count(grad_undergrad_add_up, first_years_under_total)

grad_tables |>
  write.csv('data/enrollment.csv', row.names=FALSE)




enr_codebook <- read_csv('data/vars/effy_vars.csv')


demographics <- df |>
  filter(EFFYLEV == 1) |>
  select(!EFFYLEV) |>
  pivot_longer(cols=starts_with('E'), names_to='demo') |>
  left_join(
    enr_codebook |>
      select(varName, varTitle),
    by=c('demo' = 'varName')
  ) |>
  select(!demo) |>
  rename(demo = varTitle)

demographics <- demographics |>
  rename(students = value)

message(max(demographics$YEAR))

# only focus on most recent year
demographics <- demographics |>
  filter(YEAR == max(YEAR)) |>
  select(!YEAR)

demographics <- demographics |>
  arrange(UNITID) |>
  filter(demo != 'Grand total') |>
  rename(
    Students = students,
    Demographic = demo
  )

gender <- demographics |>
  filter(Demographic %in% c('Grand total men', 'Grand total women')) |>
  mutate(
    Demographic = Demographic |>
      str_replace('Grand total', '') |>
      str_replace('Total of gender unknown and another gender', 'unknown/other') |>
      str_squish()
  )
  
gender |>
  write.csv('data/gender.csv', row.names=FALSE)

# ethnicity
ethnicity <- demographics |>
  filter(!(Demographic %in% c("Grand total men", "Grand total women"))) |>
  filter(Demographic != "Total of gender unknown and another gender") |>
  mutate(
    Demographic = Demographic |>
      str_replace('total', '') |>
      str_squish()
  ) |>
  filter(Demographic %in% c(
    "American Indian or Alaska Native",
    "Asian",
    "Black or African American",
    "Hispanic or Latino",
    "Native Hawaiian or Other Pacific Islander",
    "White",
    "Two or more races",
    "Race/ethnicity unknown"
  ))

ethnicity |>
  write.csv('data/ethnicity.csv', row.names=FALSE)