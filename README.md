UniData is a higher education data search engine developed by [Declan Bradley](https://www.declanrjb.com/). It relies on data from the [Common Dataset](https://commondataset.org/), the [U.S. Department of Education](https://nces.ed.gov/ipeds/use-the-data), and ProPublica's [nonprofit explorer](https://projects.propublica.org/nonprofits/). The [engine interface](https://declanrjb.github.io/college-search/) standardizes the following datasets, which are also available in tidy data form.

UniData was presented as a talk at #NICAR26. Slides for that talk are available [here](https://docs.google.com/presentation/d/e/2PACX-1vQYDnVdDRRDW_20JoMH2YtIkL7rGsVl2hzQMaidxlMbPD2KNzcb-7rhTZjBg9tCPCe8NIX_oI2-0O-n/pub?start=false&loop=false&delayms=3000).

# Clery Data

## Campus Crime

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy format](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/campus-crime.csv) |

Combined crime data detailing incidents of sexual violence, arson, burglary, murder, and other on-campus criminal acts. 

Where an institution has multiple branch campuses, the engine displays statistics for only the primary campus. Branch campuses are listed separately in the complete data file.

## Campus Discipline

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy format](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/discipline.csv) |

Combined data on campus disciplinary incidents less serious than those considered campus crime – typically underage use of alcohol and other drugs. 

Where an institution has multiple branch campuses, the engine displays statistics for only the primary campus. Branch campuses are listed separately in the complete data file.

## Hate Incidents

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy data](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/hate_incidents.csv) |

Note: in raw form this data is too large to store on GitHub. To save on space the tidy dataset **includes only rows where the number of incidents is not 0**. For original raw data, see the [official Clery Act database](https://ope.ed.gov/campussafety/#/).

On-campus hate incidents for the selected years. Engine provides two breakdowns of the same incident counts: the first by the type of crime committed (intimidation, vandalism, assault, etc), the second by the incident motivation (race/ethnicity, national origin, sexual orientation, etc.) Both datasets are available in full as separate downloads.

# IPEDs Data

## Admissions Statistics

| Data Source | [Integrated Postsecondary Education Dataset (IPEDs)](https://nces.ed.gov/ipeds/use-the-data) |
| ----- | --------- |
| Years | 2014-2024 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy format](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/admissions.csv) |

Admissions summary statistics for the selected years, including raw applicant, admit, and enrolled student counts from IPEDs along with calculated admission and yield rates. Provided statistics are calculated for all student demographics, original IPEDs data provides more granular data grouped by applicant gender.

## Enrollment

| Data Source | [Integrated Postsecondary Education Dataset (IPEDs)](https://nces.ed.gov/ipeds/use-the-data) |
| ----- | --------- |
| Years | 2014-2024 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy format](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/enrollment.csv) |

Fall enrollment by number of undergraduate, graduate, and first-time students, selected years. First-time student counts are drawn from the IPEDS subset `EFALEVEL == 24`, which expands to "Full-time students, Undergraduate, Degree/certificate-seeking, First-time."

## Student Demographics

| Data Source | [Integrated Postsecondary Education Dataset (IPEDs)](https://nces.ed.gov/ipeds/use-the-data) |
| ----- | --------- |
| Years | 2024 |
| Engine Provides | Summary data |
| Complete Data Available | [Tidy format](https://raw.githubusercontent.com/declanrjb/college-search/refs/heads/main/data/tidy/demographics.csv) |

Fall enrollment broken down by race/ethnicity and gender, most recent year. Complete data for all years available as a tidy data file. Engine data provides these counts separately and in aggregate, original IPEDs data provides them in combination (African American Men, African American Women, etc.)

# Financial Data

## Financial Position

| Data Source | [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/) |
| ----- | --------- |
| Years | 2011-2023 |
| Engine Provides | Summary data, access to documents |
| Complete Data Available | Via [ProPublica API](https://projects.propublica.org/nonprofits/api) |

Institution revenue, expenses, financial assets, and liabilities, selected years. Original IRS 990 filings for the selected years can be accessed from the engine's summary tables.

## Highest Paid Employees

| Data Source | [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/) |
| ----- | --------- |
| Years | 2023 |
| Engine Provides | Summary data, access to documents |
| Complete Data Available | Via [ProPublica API](https://projects.propublica.org/nonprofits/api) |

Names, positions, and compensation packages for the institution's highest paid officers and employees, most recent year. May also include trustees of the institution who do not receive direct financial compensation.