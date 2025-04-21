#!/bin/bash
sleep 5

n8n import:credentials --input=/data/n8n_credentials.json
n8n import:workflow --input=/data/n8n_workflow.json
n8n update:workflow --id=dP0qL0Tsdv6b9VwB --active=true
n8n start