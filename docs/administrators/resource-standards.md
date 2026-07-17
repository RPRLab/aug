---
icon: lucide/scale
tags:
  - Governance
  - EC2
  - EBS
  - S3
  - Tags
---

# Resource standards

These standards summarize the decisions that govern resources in the lab AWS organization. Administrators should use them when reviewing requests, maintaining shared infrastructure, and cleaning up costs.

## Account placement

The `rprlab` management account is reserved for organization-level administration: IAM Identity Center, AWS Organizations, consolidated billing, budgets, and organization-wide controls.

Run research workloads only in the `research` member account. Do not place EC2 instances, research data, application AMIs, or ordinary project resources in the management account.

## EC2 is temporary compute

Treat EC2 instances as replaceable compute environments rather than permanent servers:

1. Copy the required input data from S3.

2. Perform active work on attached EBS storage.

3. Copy results and reproducibility material back to S3.

4. Terminate the instance when the work is complete.

Stopping is appropriate only when an instance will be resumed soon. Stopped instances retain EBS volumes and can continue to generate storage costs.

## EBS is temporary working storage

Volumes created for approved research instances must default to `DeleteOnTermination = true`. Exceptions require a clear owner, project, retention purpose, and cleanup date.

Administrators should periodically review unattached volumes, oversized volumes, and stopped instances. An unattached volume remains billable until it is deleted.

## S3 is long-term shared storage

The lab's private research bucket uses an account- and Region-specific name. Preserve the following top-level structure:

| Prefix              | Purpose                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `projects/`         | Durable project inputs, outputs, and reproducibility material organized by short project code |
| `shared/`           | Resources reused across projects                                                              |
| `shared/databases/` | Shared reference databases that should not be duplicated across projects or images            |
| `users/`            | Temporary personal transfer and configuration space; not authoritative project storage        |

When a user leaves, review and remove their `users/<username>/` content after transferring anything that belongs in `projects/` or `shared/`.

## AMI content

Administrators maintain official AMIs for standard software foundations and specific applications. Researchers should launch them through approved launch templates.

Do not bake large reference databases, project inputs, or analysis outputs into an AMI by default. Keep shared data in S3 and copy or synchronize it to EBS when needed. An application-specific exception must document its storage cost, update process, and reason that startup hydration is unsuitable.

When an AMI is retired, deregister it and review all associated snapshots.

## Launch templates are the supported interface

Launch templates should provide the complete safe configuration for an approved environment:

- approved AMI;

- appropriate instance type;

- `rprlab-session-manager-only` security group;

- `rprlab-ec2-research-instance-role` instance profile;

- no key pair;

- correctly sized EBS volumes with deletion on termination; and

- tag specifications where practical.

Provide multiple templates or documented template options when workloads need meaningfully different compute or memory sizes. Users should not need to reconstruct security and storage settings manually.

When an AMI or another setting changes, create a new template version, test it, and then set the tested version as the default. Do not create a separate template to replace an old version of the same supported environment.

## Required tags

Tag important resources so ownership and cleanup decisions are explicit.

| Tag       | Expected value                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| `Owner`   | IAM Identity Center username of the responsible person, or `admin` for shared administrator-managed resources |
| `Project` | Lowercase, hyphenated project code, or `shared` for cross-project infrastructure                              |
| `Version` | Date or semantic version for versioned shared resources such as AMIs                                          |

For example:

```text
Owner=admin
Project=shared
Version=2026-07-17
```

Tags do not replace documentation. Shared AMIs, templates, roles, security groups, buckets, and exceptional retained volumes should also have meaningful names and descriptions.
