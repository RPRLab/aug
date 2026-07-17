---
icon: lucide/dna
tags:
  - AMI
  - EC2
  - Hoodini
---

# Hoodini AMI example

This page records how the initial Hoodini environment was built on 16 July 2026. It used Ubuntu 26.04 LTS and commit `a66a7d7` of the [`leightonpayne/hoodini`](https://github.com/leightonpayne/hoodini) fork.

!!!Warning "Documented data exception"

    This image includes approximately 45 GB of Hoodini reference databases. Its backing snapshot was approximately 70 GiB when built. This is an explicit exception to the normal [AMI content standard](resource-standards.md#ami-content), under which large data belongs in S3 and is hydrated onto temporary EBS storage when needed.

## Recorded build configuration

The build instance used the following settings:

| Setting              | Recorded value                      |
| -------------------- | ----------------------------------- |
| Base image           | Ubuntu Server 26.04 LTS, x86_64     |
| Build instance       | `t3.xlarge`                         |
| Build root volume    | 100 GiB                             |
| Key pair             | None                                |
| Security group       | `rprlab-session-manager-only`       |
| IAM instance profile | `rprlab-ec2-research-instance-role` |
| Access method        | Systems Manager Session Manager     |

Launch this short-lived builder in the `research` account. The instance type is only for the build process; the resulting AMI can run on compatible x86_64 instance types. Follow the general [AMI preparation procedure](amis.md#preparing-the-instance) and verify that the root volume is large enough before downloading the databases.

## Installing Hoodini

Connect with Session Manager and install the prerequisites:

```sh title="shell"
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y \
    build-essential \
    zlib1g-dev \
    python3-dev

# Check the SSM Agent, should say enabled and active
sudo snap services amazon-ssm-agent

curl -fsSL https://pixi.sh/install.sh | bash
sudo ln -sf "$HOME/.pixi/bin/pixi" /usr/local/bin/pixi
```

Clone the pinned source and record the exact commit in the image:

```sh title="shell"
cd /opt
sudo git clone https://github.com/leightonpayne/hoodini.git
cd hoodini
sudo git checkout a66a7d7
sudo git rev-parse HEAD | sudo tee /etc/hoodini-commit.txt

sudo pixi install
sudo pixi lock
```

The extra `pixi lock` was needed for the lock-file format at this recorded commit because it was complaining about outdated lock-file format version.

Download the data:

```sh title="shell"
sudo pixi run hoodini download databases
sudo pixi run hoodini download metacerberus \
    amrfinder,cazy,cog,foam,gvdb,kegg,kofam,methmmdb,nfixdb,pfam,pgap,phrog,pvog,tigrfam,vog-r225
```

Install a wrapper so users can invoke Hoodini from any directory without Pixi updating the environment:

```sh title="shell"
sudo tee /usr/local/bin/hoodini >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
PROJECT=/opt/hoodini
exec pixi run \
    --as-is \
    --manifest-path "$PROJECT/pyproject.toml" \
    hoodini "$@"
EOF

sudo chmod 755 /usr/local/bin/hoodini
```

Run a small representative input to trigger downloading the assembly summaries:

```sh title="shell"
cat > ~/test-input.txt <<'EOF'
WP_206356263.1
HFU9245413.1
WP_421098225.1
WP_247173889.1
WP_174771187.1
EOF

hoodini run \
    --input ~/test-input.txt \
    --output ~/test-output \
    --min-win 0 \
    --num-threads 8
```

Confirm that the run succeeds and inspect its output. Then remove test output, downloads, caches, credentials, and other build residue. Review paths before deleting them:

```sh title="shell"
rm -rf ~/test-input.txt ~/test-output ~/.cache
sudo rm -rf /root/.ssh
sudo apt-get clean
history -c
```

## Creating and testing the AMI

Create the AMI with these recorded details:

| Field         | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Name          | `rprlab-ubuntu26-hoodini-v0.1`                                             |
| Description   | `RPR Lab Hoodini AMI on Ubuntu using leightonpayne/hoodini commit a66a7d7` |
| `Owner` tag   | `admin`                                                                    |
| `Project` tag | `shared`                                                                   |
| `Version` tag | `2026-07-16`                                                               |

Wait until the AMI is `available`, then launch a test instance with the standard no-inbound security group and instance profile. Connect with Session Manager, confirm that `/etc/hoodini-commit.txt` contains `a66a7d7`, and repeat the small test.

Terminate both the test instance and the original builder after the image passes. Verify that their temporary EBS volumes were deleted.

## Publishing the launch template

The initial supported template was recorded as:

| Setting              | Recorded value                      |
| -------------------- | ----------------------------------- |
| Template             | `rprlab-hoodini-standard`           |
| AMI                  | `rprlab-ubuntu26-hoodini-v0.1`      |
| Default instance     | `c7i.2xlarge`                       |
| Root volume          | 250 GiB, delete on termination      |
| Key pair             | None                                |
| Security group       | `rprlab-session-manager-only`       |
| IAM instance profile | `rprlab-ec2-research-instance-role` |

Launch through the template itself and repeat the small test.
