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
  
  # drop unitids that have multiple branches
  df <- df |> 
    mutate(unitid_prime = substr(unitid, 0, 6))
  
  unique_unitids <- df |>
    group_by(unitid_prime) |> 
    summarize(unitid_variants = length(unique(unitid))) |> 
    filter(unitid_variants == 1) |>
    pull(unitid_prime)

  df <- df |>
    filter(unitid_prime %in% unique_unitids)
  
  df <- df |>
    mutate(unitid = substr(unitid, 0, 6)) |>
    select(!unitid_prime)

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

crime_matrix <- crime_matrix |>
  select(unitid, year, Murder, `Negligent Manslaughter`, Robbery, `Aggravated Assault`, Burglary, `Motor Vehicle Theft`, Arson, Rape, Fondling, Incest, `Statuatory Rape`)

crime_matrix |>
  rename(Year = year) |>
  arrange(desc(Year)) |>
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

discipline_df <- discipline_df |>
  select(unitid, inst_name, year, crime, occurrences) |>
  unique()

discipline_df |>
  write.csv('data/tidy/discipline.csv', row.names=FALSE)

discipline_matrix <- discipline_df |> 
  pivot_wider(id_cols=c('unitid', 'year', 'inst_name'), names_from='crime', values_from='occurrences')

discipline_matrix |>
  select(!inst_name) |>
  rename(Year = year) |>
  arrange(desc(Year)) |>
  write.csv('data/web/discipline.csv', row.names=FALSE)

# hate incidents
data_files <- files_df |> 
  filter(name == 'oncampushate', extension == 'xlsx') |> 
  pull(path)

df <- data_files |>
  lapply(read_clery_file) %>%
  do.call(rbind, .) |>
  unique()

temp <- df

# breakpoint
df <- temp

# split out bias motivation
df <- df |> 
  mutate(
    crime_original = crime,
    bias = str_split_i(crime, '_', -1), 
    crime = str_split_i(crime, '_', 1)
  )

# drop the overall rows that have no specified motivation
df <- df |> 
  filter(crime != bias)

# check lines to make sure these split artifacts aren't meaningful
df |> 
  filter(bias == 'A') |> 
  pull(crime_original) |> 
  unique()

df |> 
  filter(bias == 'T') |> 
  pull(crime_original) |> 
  unique()

# they are not
# this also confirms that those lines are overall lines, and we're not dropping a demographic
df <- df |>
  filter(!(bias %in% c('A', 'T')))

# if this is correct, there should be the same number of crimes for each demographic and the same number of demos for each crime
# crimes per bias passes checks
df |> 
  group_by(bias) |> 
  summarize(crimes = length(unique(crime)))

# biases per crime passes check
df |> 
  group_by(crime) |> 
  summarize(crimes = length(unique(bias)))
# safe to proceed

# update crime names
df <- df |>
  filter(crime != 'FILTER') |>
  mutate(
    crime = case_when(
      crime == 'MURD' ~ 'Murder',
      crime == 'NEG_M' ~ 'Negligent Manslaughter',
      crime == 'RAPE' ~ 'Rape',
      crime == 'FOND' ~ 'Fondling',
      crime == 'INCE' ~ 'Incest',
      crime == 'STAT' ~ 'Statuatory Rape',
      crime == 'ROBBE' ~ 'Robbery',
      crime == 'AGG' ~ 'Aggravated Assault',
      crime == 'BURGLA' ~ 'Burglary',
      crime == 'VEHIC' ~ 'Motor Vehicle Theft',
      crime == 'ARSON' ~ 'Arson',
      crime == 'SIM' ~ 'Simple Assault',
      crime == 'LAR' ~ 'Larceny',
      crime == 'INTIM' ~ 'Intimidation',
      crime == 'VANDAL' ~ 'Vandalism'
    )
  )

df <- df |>
  filter(!is.na(bias)) |>
  filter(!(bias %in% c('A', 'T'))) |>
  mutate(bias = case_when(
    bias == 'RAC' ~ 'Race',
    bias == 'REL' ~ 'Religion',
    bias == 'SEX' ~ 'Sexual Orientation',
    bias == 'GEN' ~ 'Gender',
    bias == 'GID' ~ 'Gender Identity',
    bias == 'DIS' ~ 'Disability',
    bias == 'ET' ~ 'Ethnicity',
    bias == 'NAT' ~ 'National Origin'
  ))

df <- df |>
  select(unitid, inst_name, year, crime, bias, occurrences) |>
  unique()

df |>
  write.csv('data/tidy/hate-incidents.csv', row.names=FALSE)

most_common_crimes <- df |> 
  group_by(crime) |> 
  summarize(total_hate = sum(occurrences)) |> 
  arrange(desc(total_hate)) |> 
  head(n=5) |> 
  pull(crime)

web_df <- df |>
  filter(crime %in% most_common_crimes)

crime_matrix <- web_df |> 
  group_by(unitid, inst_name, year, crime) |> 
  summarize(occurrences = sum(occurrences)) |>
  pivot_wider(id_cols=c('unitid', 'year'), names_from='crime', values_from='occurrences') |>
  rename(Year = year)

crime_matrix |>
  write.csv('data/web/hate-by-crime.csv', row.names=FALSE)

bias_matrix <- web_df |> 
  group_by(unitid, inst_name, year, bias) |> 
  summarize(occurrences = sum(occurrences)) |>
  pivot_wider(id_cols=c('unitid', 'year'), names_from='bias', values_from='occurrences') |>
  rename(Year = year)

bias_matrix |>
  write.csv('data/web/hate-by-bias.csv', row.names=FALSE)

