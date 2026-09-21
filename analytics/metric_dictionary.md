# Dental Clinic CRM — Metric Dictionary

## Purpose

This document defines the business meaning and calculation rules for metrics used on the Admin Dashboard, Doctor Dashboard, Patient Management page, and Patient Card. All date-dependent metrics are calculated relative to `Report Date` in the clinic's local time zone.

## Common Definitions

```text
Appointment Date = DATE(appointments.date_time)

Expected Revenue = treatments.price
WHERE appointments.status IN ('scheduled', 'confirmed', 'completed')

Actual Revenue = SUM(visit.amount)
WHERE appointments.status = 'completed'
```

Required joins:

```text
appointments.treatment_id = treatments.id
visit.appointment_id = appointments.id
```

### Reporting Periods

| Period | Definition |
|---|---|
| **Report Date** | Control date used as the endpoint of reporting calculations |
| **Comparison Day** | `Report Date − 7 days` |
| **WTD** | Monday through `Report Date`, inclusive |
| **Previous WTD** | The same number of days in the previous week |
| **Full Reporting Week** | Monday–Saturday of the week containing `Report Date` |
| **Previous Full Week** | Monday–Saturday of the previous week |
| **Current MTD** | First day of the current month through `Report Date`, inclusive |
| **Previous Comparable Period** | The same number of calendar days from the beginning of the previous month |
| **Last Full Month** | Calendar month preceding the month of `Report Date` |

### Change %

**Business purpose:** Shows whether a KPI is improving, declining, or remaining stable relative to its comparison period.

```text
Change % =
(Current Value − Previous Value) / Previous Value × 100%
```

- both values are `0` — `0%`;
- previous value is `0` and current value is positive — `New`;
- previous value is unavailable — `N/A`;
- for cancellations, no-shows, and inactive patients, a decrease is interpreted as positive.

---

## 1. Admin Dashboard

The Admin Dashboard provides an operational overview of the clinic's daily workload, appointment outcomes, and expected versus actual revenue.

### 1.1 Patients Today

**Business purpose:** Helps the administrator estimate the current patient flow and prepare clinic resources for the day.

Number of unique patients with a non-cancelled appointment on `Report Date`.

```text
COUNT(DISTINCT patient_id)
WHERE Appointment Date = Report Date
  AND status <> 'cancelled'
```

Each patient is counted once regardless of the number of appointments. Comparison: `Comparison Day`.

### 1.2 Daily Appointments

**Business purpose:** Shows the clinic's scheduled workload and supports daily capacity management.

Number of non-cancelled appointments on `Report Date`.

```text
COUNT(DISTINCT appointments.id)
WHERE Appointment Date = Report Date
  AND status <> 'cancelled'
```

Comparison: `Comparison Day`.

### 1.3 Daily Revenue

**Business purpose:** Estimates the revenue potential of the current day's appointment schedule.

Expected revenue from appointments on `Report Date`.

```text
SUM(Expected Revenue)
WHERE Appointment Date = Report Date
```

Includes `scheduled`, `confirmed`, and `completed`; excludes `cancelled` and `no_show`. Comparison: expected revenue on `Comparison Day`.

### 1.4 Monthly Revenue

**Business purpose:** Tracks actual financial performance during the current month and highlights changes from the previous month.

Actual revenue from the first day of the month through `Report Date`.

```text
SUM(visit.amount)
WHERE status = 'completed'
  AND Appointment Date >= Month Start
  AND Appointment Date <= Report Date
```

Comparison: `Previous Comparable Period`. If the previous month is shorter, the comparison uses the same number of available calendar days in both periods.

### 1.5 Appointment Outcomes

**Business purpose:** Reveals how many appointments generate completed visits and how many are lost through cancellations or no-shows.

Distribution of appointments in `Last Full Month` by final status:

- `completed`;
- `cancelled`;
- `no_show`.

```text
COUNT(DISTINCT appointments.id)
GROUP BY status
```

`scheduled` and `confirmed` are excluded. The chart total is the sum of the three final-status categories.

### 1.6 Weekly Revenue

**Business purpose:** Supports weekly revenue planning by comparing expected income with revenue already realized.

The primary value is expected revenue for `Full Reporting Week`.

```text
Weekly Expected Revenue = SUM(Expected Revenue)
```

The daily chart shows:

- `Daily Expected Revenue` — the planned treatment price for eligible appointments;
- `Daily Actual Revenue` — `SUM(visit.amount)` for completed appointments.

The values are displayed side by side and are not stacked. Comparison: expected revenue for `Previous Full Week`.

### 1.7 Peak Day

**Business purpose:** Identifies the busiest revenue-generating day so staffing and operational resources can be allocated appropriately.

The earliest calendar day in `Full Reporting Week` with the highest `Daily Expected Revenue`. Actual revenue does not affect the result.

---

## 2. Doctor Dashboard

The Doctor Dashboard shows weekly activity, workload, appointment outcomes, and expected revenue for the selected doctor. All metrics in this section are filtered by `doctor_id`.

### 2.1 Patients

**Business purpose:** Measures the doctor's current patient flow and helps monitor weekly demand for their services.

```text
COUNT(DISTINCT patient_id)
WHERE Appointment Date is in WTD
  AND status <> 'cancelled'
```

Comparison: `Previous WTD`.

### 2.2 Completed Visits

**Business purpose:** Measures the doctor's realized clinical activity and completed workload.

```text
COUNT(DISTINCT appointments.id)
WHERE Appointment Date is in WTD
  AND status = 'completed'
```

Comparison: `Previous WTD`.

### 2.3 Cancelled Visits

**Business purpose:** Highlights schedule capacity lost through cancellations and supports timely rescheduling.

```text
COUNT(DISTINCT appointments.id)
WHERE Appointment Date is in WTD
  AND status = 'cancelled'
```

Comparison: `Previous WTD`; a decrease is positive.

### 2.4 No-show

**Business purpose:** Monitors unattended appointments that reduce doctor utilization and potential revenue.

```text
COUNT(DISTINCT appointments.id)
WHERE Appointment Date is in WTD
  AND status = 'no_show'
```

Comparison: `Previous WTD`; a decrease is positive.

### 2.5 Workload

**Business purpose:** Shows how fully the doctor's available working time is used and helps detect underload or overload.

```text
Workload =
SUM(appointments.duration)
/ Available Working Minutes × 100%
```

Calculated for `Full Reporting Week`. Includes `scheduled`, `confirmed`, `completed`, and `no_show`; excludes `cancelled`. Available time is based on the doctor's current schedule, excluding non-working hours and breaks.

### 2.6 Weekly Revenue

**Business purpose:** Estimates the doctor's weekly revenue contribution and supports schedule planning.

```text
SUM(Expected Revenue)
WHERE Appointment Date is in Full Reporting Week
```

Displayed by day. Comparison: `Previous Full Week`.

### 2.7 Weekly Appointments

**Business purpose:** Shows how appointments are distributed across the week and helps balance the doctor's schedule.

```text
COUNT(DISTINCT appointments.id)
WHERE Appointment Date is in Full Reporting Week
  AND status <> 'cancelled'
GROUP BY Appointment Date
```

Includes `scheduled`, `confirmed`, `completed`, and `no_show`. Comparison: `Previous Full Week`.

### 2.8 Peak Day

**Business purpose:** Identifies the doctor's highest-revenue day so workload and supporting resources can be planned in advance.

Day in `Full Reporting Week` with the highest `Daily Expected Revenue`; if several days tie, select the earliest one.

### Color Interpretation

- `Patients`, `Completed Visits`, and `Weekly Revenue`: increase — positive; decrease — negative.
- `Cancelled Visits` and `No-show`: decrease — positive; increase — negative.
- No change or unavailable comparison — neutral.

---

## 3. Patient Management

The Patient Management page summarizes the size and activity of the clinic's patient base.

### 3.1 Total Registered Patients

**Business purpose:** Shows the total size of the accumulated patient database available for service and communication.

```text
COUNT(DISTINCT patients.id)
WHERE DATE(users.registration_date) <= Report Date
```

Join: `patients.user_id = users.id`. This is an all-time value and has no period comparison.

### 3.2 Total Patients / Patients MTD

**Business purpose:** Measures the number of patients currently involved in the clinic's appointment flow.

```text
COUNT(DISTINCT patient_id)
WHERE Appointment Date is in Current MTD
  AND status <> 'cancelled'
```

Includes `scheduled`, `confirmed`, `completed`, and `no_show`. Comparison: `Previous Comparable Period`.

### 3.3 New Patients

**Business purpose:** Measures successful acquisition of patients who completed their first visit during the reporting period.

```text
First Completed Visit =
MIN(Appointment Date)
WHERE status = 'completed'
GROUP BY patient_id

New Patients =
COUNT(DISTINCT patient_id)
WHERE First Completed Visit is in Current MTD
```

A patient becomes new on the date of the first completed visit, not on registration or appointment creation. Comparison: `Previous Comparable Period`.

### 3.4 Returning Patients

**Business purpose:** Indicates repeat engagement and the clinic's ability to bring existing patients back for further care.

```text
COUNT(DISTINCT patient_id)
WHERE status = 'completed'
  AND Appointment Date is in Current MTD
  AND First Completed Visit < Month Start
```

`New Patients` and `Returning Patients` are mutually exclusive. Comparison: `Previous Comparable Period`.

### 3.5 Inactive Patients

**Business purpose:** Identifies patients who may require reactivation or preventive-care reminders.

```text
Last Completed Visit =
MAX(Appointment Date)
WHERE status = 'completed'
GROUP BY patient_id

Inactive Patients =
COUNT(DISTINCT patient_id)
WHERE Last Completed Visit < Report Date - 6 months
  AND no future appointment exists
      with status IN ('scheduled', 'confirmed')
```

Patients without completed visits are excluded. Comparison: status as of the corresponding date in the previous month; a decrease is positive.

---

## 4. Patient Card

The Patient Card summarizes the selected patient's visit history, future appointment, value, attendance behavior, and preventive-visit status. All metrics are filtered by `patient_id`.

### 4.1 Completed Visits

**Business purpose:** Summarizes the patient's completed treatment history and level of engagement with the clinic.

```text
COUNT(DISTINCT appointments.id)
WHERE appointments.patient_id = Selected Patient
  AND appointments.status = 'completed'
```

### 4.2 Next Appointment

**Business purpose:** Supports continuity of care by showing whether the patient already has a future visit scheduled.

```text
MIN(appointments.date_time)
WHERE appointments.patient_id = Selected Patient
  AND appointments.date_time > Current Date and Time
  AND appointments.status IN ('scheduled', 'confirmed')
```

If no qualifying appointment exists, display `No upcoming appointments`.

### 4.3 Patient Value

**Business purpose:** Shows the patient's accumulated financial contribution to the clinic.

```text
SUM(visit.amount)
WHERE appointments.patient_id = Selected Patient
  AND appointments.status = 'completed'
```

Only amounts from completed visits are included.

### 4.4 No-shows

**Business purpose:** Shows how many appointments were lost because the patient did not attend.

```text
COUNT(DISTINCT appointments.id)
WHERE appointments.patient_id = Selected Patient
  AND appointments.status = 'no_show'
```

### 4.5 No-show Rate

**Business purpose:** Assesses the patient's attendance reliability relative to visits that were either completed or missed.

```text
No-show Rate =
No-shows / (Completed Visits + No-shows) × 100%
```

`cancelled`, `scheduled`, and `confirmed` are excluded. If the denominator is `0`, display `N/A`.

### 4.6 Hygiene

**Business purpose:** Identifies whether the patient may need a preventive follow-up reminder.

```text
Last Completed Visit =
MAX(appointments.date_time)
WHERE appointments.patient_id = Selected Patient
  AND appointments.status = 'completed'
```

| Status | Rule |
|---|---|
| **Up-to-date** | Less than 6 months since the last completed visit |
| **Overdue** | 6 months or more since the last completed visit |
| **N/A** | No completed visits |

### 4.7 Last Visit

**Business purpose:** Provides an immediately understandable measure of how recently the patient received care.

Number of full months between the patient's last completed visit and the current date, for example: `Last visit — 4 months ago`.

---

## Data Quality and Limitations

- Count appointments by `appointments.id` and patients by `patients.id` or `patient_id`, never by names or appointment rows.
- Use the clinic's local time zone for all date boundaries.
- Apply identical status rules and period lengths to current and comparison values.
- Actual revenue and `Patient Value` include only `visit.amount` linked to completed appointments.