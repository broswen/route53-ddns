# Route53 DDNS with Api Gateway and Lambda

This is a simple DDNS API to allow home servers to update Route53 records with their IP address.

## Usage

1. Deploy the Serverless project with an environment variable file `serverless.{stage}.yaml` that specifies which Hosted Zones the API should be allowed to modify.

```
allowedHostedZones:
  - arn:aws:route53:::hostedzone/ZONE_ID_HERE
```
1. Call the endpoint `/ZONE_ID_HERE/test.example.com` with a `POST` request. This will set the `test.example.com` record to the IP address that it is being called from. 

1. It will respond with the request information
```json 
{
  "hostedZoneId": "ZONE_ID_HERE",
  "name": "test.example.com",
  "sourceIp": "127.0.0.1"
}
```