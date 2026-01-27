library(tidyverse)
library(readxl)

read_clery_file <- function(file) {
  df <- read_excel(file)

  # select only crime columns
  df <- df |> 
    select(UNITID_P, INSTNM, matches('.*[0-9]+$')) |>
    rename(inst_name = INSTNM)

  df <- df |>
    pivot_longer(cols=matches('.*[0-9]+$'), names_to='crime', values_to="count")

  df <- df |> 
    mutate(
      year = str_extract(crime, '[0-9]+') %>% 
        paste('20', ., sep=''),
      crime = str_extract(crime, '[^0-9]+')
    )
  
  # only take the most recent year from each file, to control for revisions
  # (which otherwise cause inconsistent duplicates)
  df <- df |>
    filter(year == max(year))
  
  df <- df |>
    rename(
      unitid = UNITID_P,
      occurrences = count
    ) |>
  select(unitid, year, inst_name, crime, occurrences)
  
  return(df)
}

directory <- read_csv('data/raw/ipeds/HD2024.csv')

files_df <- list.files('data', recursive=TRUE, full.names = TRUE) |> 
  as.data.frame()

colnames(files_df) <- c('path')

files_df <- files_df |> 
  mutate(stem = str_split_i(path, '/', -1)) |> 
  mutate(
    extension = str_split_i(path, '\\.', -1),
    name = str_split_i(stem, '[0-9]+', 1) |> 
      str_to_lower()
  )

data_files <- files_df |> 
  filter(name == 'oncampuscrime', extension == 'xls') |> 
  pull(path)

df <- data_files |>
  lapply(read_clery_file) %>%
  do.call(rbind, .) |>
  unique()

# update crime names
df <- df |>
  filter(crime != 'FILTER') |>
  mutate(
    crime = case_when(
      crime == 'MURD' ~ 'Murder',
      crime == 'NEG_M' ~ 'Negligent Manslaughter',
      crime == 'RAPE' ~ 'Rape',
      crime == 'FONDL' ~ 'Fondling',
      crime == 'INCES' ~ 'Incest',
      crime == 'STATR' ~ 'Statuatory Rape',
      crime == 'ROBBE' ~ 'Robbery',
      crime == 'AGG_A' ~ 'Aggravated Assault',
      crime == 'BURGLA' ~ 'Burglary',
      crime == 'VEHIC' ~ 'Motor Vehicle Theft',
      crime == 'ARSON' ~ 'Arson'
    )
  )

df <- df |>
  select(unitid, inst_name, year, crime, occurrences) |>
  unique()

df |>
  write.csv('data/tidy/campus-crime.csv', row.names=FALSE)

crime_matrix <- df |> 
  pivot_wider(id_cols=c('unitid', 'year', 'inst_name'), names_from='crime', values_from='occurrences')

crime_matrix |>
  select(!inst_name) |>
  rename(Year = year) |>
  write.csv('data/web/campus-crime.csv', row.names=FALSE)

# retrieve discipline
data_files <- files_df |> 
  filter(name == 'oncampusdiscipline', extension == 'xls') |> 
  pull(path)

discipline_df <- data_files |>
  lapply(read_clery_file) %>%
  do.call(rbind, .)

discipline_df <- discipline_df |>
  filter(crime != 'FILTER') |>
  mutate(
    crime = case_when(
      crime == 'WEAPON' ~ 'Weapon Possession (Discipline)',
      crime == 'DRUG' ~ 'Drug Law Violation',
      crime == 'LIQUOR' ~ 'Liquor Law Violation'
    )
  )
