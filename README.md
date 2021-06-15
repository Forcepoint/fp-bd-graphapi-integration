# bd-fp-graphapi-integration
Integrating Forcepoint Products with Azure Graph API

## Build

  ```bash
  ./build/create-deployment.sh; \
  docker build -t fp-graphapi-exporter .;
  ```
## Implementation

Run the container with the command below, replacing the **\<Azure-Graph-Client-Id\> \<Azure-Graph-Tenant-Id\> \<Azure-Graph-Client-Secret\>**

  ```bash
  docker run --detach \
  --env "GRAPH_CLIENT_ID=<Azure-Graph-Client-Id>" \
  --env "GRAPH_TENANT_ID=<Azure-Graph-Tenant-Id>" \
  --env "GRAPH_CLIENT_SECRET=<Azure-Graph-Client-Secret>" \
  --name fp-graphapi-exporter \
  --restart always \
  --volume FpGraphAPIExporterDataVolume:/app/fp-graphapi-exporter/data \
  --volume FpGraphAPIExporterLogsVolume:/app/fp-graphapi-exporter/logs \
  fp-graphapi-exporter
  ```

Or run the command below using a config file, replacing the **\<config-yml-path\>**

  ```bash
  docker run --detach \
  --name fp-graphapi-exporter \
  --restart always \
  --volume <config-yml-path>:/app/fp-graphapi-exporter/config/config.yml \
  --volume FpGraphAPIExporterDataVolume:/app/fp-graphapi-exporter/data \
  --volume FpGraphAPIExporterLogsVolume:/app/fp-graphapi-exporter/logs \
  fp-graphapi-exporter
  ```
## Data Exported

#### Outlook Mail

Access the mail data of any user in a tenant.

#### Insights

Relationships calculated using advanced analytics and machine learning techniques. You can, for example, identify OneDrive documents trending around users.

- Documents shared with a user. Documents can be shared as email attachments or as OneDrive for Business links sent in emails.
- Documents from OneDrive and from SharePoint sites trending around a user.
- Documents viewed and modified by a user. Includes documents the user used in OneDrive for Business, SharePoint, opened as email attachments, and as link attachments from sources like Box, DropBox and Google Drive.

#### Threat Assessment

Assess the threat received by any user in a tenant. This empowers customers to report spam emails, phishing URLs or malware attachments they receive to Microsoft.

#### Reports

With Microsoft Graph, you can access Office 365 usage reports resources to get the information about how people in your business are using Office 365 services.

- Get details about Microsoft Teams device usage by user.
- Use the Microsoft Teams activity reports to get insights into the Microsoft Teams user activity in your organization.
- Get details about email activity users have performed.
- Get details about which activities users performed on the various email apps
- Get details about mailbox usage.
- Get details about Office 365 active users.
- Get details about OneDrive activity by user.
- Get details about OneDrive usage by account.
- Get details about SharePoint activity by user.
- Get details about Skype for Business activity by user.
- Get details about Skype for Business device usage by user.
- Get details about Yammer activity by user.
- Get details about Yammer device usage by user.

## Configurations Table

<table>
<thead>
<tr class="header">
<th>Environment Variable </th>
<th>Config Variable </th>
<th>Required </th>
<th>Default Value </th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>GRAPH_TENANT_ID</td>
<td>tenantId</td>
<td>YES </td>
<td></td>
</tr>
<tr class="even">
<td>GRAPH_CLIENT_SECRET</td>
<td>clientSecret</td>
<td>YES </td>
<td></td>
</tr>
<tr class="odd">
<td>GRAPH_ENABLE_REPORTS</td>
<td>enableReports</td>
<td>No </td>
<td>true </td>
</tr>
<tr class="even">
<td>GRAPH_REPORTS_CRON_SCHEDULER </td>
<td>reportsCronScheduler </td>
<td>No </td>
<td>0 0 * * * </td>
</tr>
<tr class="odd">
<td>GRAPH_ENABLE_THREAT_ASSESSMENT_REQUESTS </td>
<td>enableThreatAssessmentRequests </td>
<td>No </td>
<td>true </td>
</tr>
<tr class="even">
<td>GRAPH_THREAT_ASSESSMENT_REQUESTS_CRON_SCHEDULER </td>
<td>threatAssessmentRequestsCronScheduler </td>
<td>No </td>
<td>0 * * * * </td>
</tr>
<tr class="odd">
<td>GRAPH_ENABLE_INSIGHTS </td>
<td>enableInsights </td>
<td>No </td>
<td>true </td>
</tr>
<tr class="even">
<td>GRAPH_INSIGHTS_CRON_SCHEDULER </td>
<td>insightsCronScheduler </td>
<td>No </td>
<td>0 * * * * </td>
</tr>
<tr class="odd">
<td>GRAPH_ENABLE_MAIL </td>
<td>enableMail </td>
<td>No </td>
<td>true </td>
</tr>
<tr class="even">
<td>GRAPH_MAIL_CRON_SCHEDULER </td>
<td>mailCronScheduler </td>
<td>No </td>
<td>0 * * * * </td>
</tr>
<tr class="odd">
<td>APP_ENABLE_DELETE_FILES </td>
<td>enableDeleteFiles </td>
<td>No </td>
<td>true </td>
</tr>
<tr class="even">
<td>APP_DELETE_FILES_CRON_SCHEDULER </td>
<td>deleteFilesCronScheduler </td>
<td>No </td>
<td>0 0 1 * * </td>
</tr>
<tr class="odd">
<td>APP_DELETE_FILES_DAYS_OLD </td>
<td>deleteFilesDaysOld </td>
<td>No </td>
<td>30 </td>
</tr>
<tr class="even">
<td>APP_DATA_DIRECTORY_PATH </td>
<td>dataDirectoryPath </td>
<td>No </td>
<td>\<fp-graphapi-exporter-home-path\>/data </td>
</tr>
</tbody>
</table>

## Example of a configuration file

```yml
services:
  graph:
    clientId: ""
    tenantId: ""
    clientSecret: ""
    enableReports: false
    reportsCronScheduler: "0 0 * * *'" # run everyday at midnight
    enableThreatAssessmentRequests: false
    threatAssessmentRequestsCronScheduler: "*0 * * * *" # run every hour
    enableInsights: false
    insightsCronScheduler: "*0 * * * *"
    enableMail: false
    mailCronScheduler: "*0 * * * *"
  app:
    name: "fp-graph-api"
    enableDeleteFiles: false
    deleteFilesCronScheduler: "0 0 1 * *" # run every 00:00 on day-of-month 1
    deleteFilesDaysOld: 1
    dataDirectoryPath: /opt/fp-graph-api/data
```