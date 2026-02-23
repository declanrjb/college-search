UniData is a higher education data search engine developed by Declan Bradley. It is intended for use by education reporters or data journalists seeking high level summary data on accredited institutions of higher education in the United States. The [engine interface](https://declanrjb.github.io/college-search/) standardizes the following datasets, which are also available in tidy data form.

## Campus Crime

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/datafile/list) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | Tidy format |

Combined crime data detailing incidents of sexual violence, arson, burglary, murder, and other on-campus criminal acts. 

Where an institution has multiple branch campuses, the engine displays statistics for only the primary campus. Branch campuses are listed separately in the complete data file.

## Campus Discipline

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/datafile/list) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | Tidy format |

Combined data on campus disciplinary incidents less serious than those considered campus crime – typically underage use of alcohol and other drugs. 

Where an institution has multiple branch campuses, the engine displays statistics for only the primary campus. Branch campuses are listed separately in the complete data file.

## Hate Incidents

| Data Source | [U.S. Department of Education Jeanne Clery Act Central Database](https://ope.ed.gov/campussafety/#/datafile/list) |
| ----- | --------- |
| Years | 2019-2023 |
| Engine Provides | Summary data |
| Complete Data Available | Two tidy data files: by incident type, by discriminated group |

On-campus hate incidents for the selected years. Engine provides two breakdowns of the same incident counts: the first by the type of crime committed (intimidation, vandalism, assault, etc), the second by the incident motivation (race/ethnicity, national origin, sexual orientation, etc.) Both datasets are available in full as separate downloads.

## Admissions Statistics

| Data Source | [Integrated Postsecondary Education Dataset (IPEDs)](https://nces.ed.gov/ipeds/use-the-data) |
| ----- | --------- |
| Years | 2014-2024 |
| Engine Provides | Summary data |
| Complete Data Available | Tidy format |

Admissions summary statistics for the selected years, including raw applicant, admit, and enrolled student counts from IPEDs along with calculated admission and yield rates. Provided statistics are calculated for all student demographics, original IPEDs data provides more granular data grouped by applicant gender.

## Enrollment

| Data Source | [Integrated Postsecondary Education Dataset (IPEDs)](https://nces.ed.gov/ipeds/use-the-data) |
| ----- | --------- |
| Years | 2014-2024 |
| Engine Provides | Summary data |
| Complete Data Available | Tidy format |

Fall enrollment by number of undergraduate, graduate, and first-time students, selected years. First-time student counts are drawn from IPEDS `EFALEVEL == 24`, "Full-time students, Undergraduate, Degree/certificate-seeking, First-time."

## Student Demographics

TK

## Financial Position

| Data Source | [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/) |
| ----- | --------- |
| Years | 2011-2023 |
| Engine Provides | Summary data, access to documents |
| Complete Data Available | Via [ProPublica api](https://projects.propublica.org/nonprofits/api) |

Institution revenue, expenses, financial assets, and liabilities, selected years. Original IRS 990 filings for the selected years can be accessed from the engine's summary tables.

## Highest Paid Employees

| Data Source | [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/) |
| ----- | --------- |
| Years | 2023 |
| Engine Provides | Summary data, access to documents |
| Complete Data Available | Via [ProPublica api](https://projects.propublica.org/nonprofits/api) |

Names, positions, and compensation packages for the institution's highest paid officers and employees, most recent year. May also include trustees of the institution who do not receive direct financial compensation.