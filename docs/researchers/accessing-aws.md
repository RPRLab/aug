---
icon: lucide/log-in
---

# Accessing AWS

You can interact with AWS through two routes: the AWS Management Console and the AWS CLI.

## Using the AWS Management Console

The AWS Management Console is a web-based application that provides access to all of the individual AWS services through a graphical interface. You can access the AWS Management Console via the lab's access portal:

[https://ssoins-6508293e3330524d.portal.eu-north-1.app.aws](https://ssoins-6508293e3330524d.portal.eu-north-1.app.aws)

## Installing the AWS CLI

You can essentially do everything through the Management Console, but if you instead want to interact with AWS via the command line, you will need to install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and the [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html).

=== ":material-apple: macOS"

    If you are unsure of your computer's architecture run:

    ```sh title="shell"
    uname -m
    ```

    === "ARM64"

        Download and install AWS CLI:

        ```sh title="shell"
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"

        sudo installer -pkg ./AWSCLIV2.pkg -target /
        ```

        Download and install the Session Manager plugin:

        ```sh title="shell"
        curl -fsSL \
            "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac_arm64/session-manager-plugin.pkg" \
            -o session-manager-plugin.pkg

        sudo installer -pkg session-manager-plugin.pkg -target /

        sudo ln -s /usr/local/sessionmanagerplugin/bin/session-manager-plugin \
            /usr/local/bin/session-manager-plugin
        ```

    === "x86-64"

        Download and install AWS CLI:

        ```sh title="shell"
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"

        sudo installer -pkg ./AWSCLIV2.pkg -target /
        ```

        Download and install the Session Manager plugin:

        ```sh title="shell"
        curl -fsSL \
            "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/session-manager-plugin.pkg" \
            -o session-manager-plugin.pkg

        sudo installer -pkg session-manager-plugin.pkg -target /

        sudo ln -s /usr/local/sessionmanagerplugin/bin/session-manager-plugin \
            /usr/local/bin/session-manager-plugin
        ```

    Alternatively, both can be installed with [Homebrew](https://brew.sh/):

    ``` sh
    brew install awscli
    brew install session-manager-plugin
    ```

=== ":material-linux: Linux"

    If you are unsure of your computer's architecture run:

    ```sh title="shell"
    uname -m
    ```

    === "ARM64"

        Download and install AWS CLI:

        ```sh title="shell"
        curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" \
            -o awscliv2.zip

        unzip awscliv2.zip
        sudo ./aws/install
        ```

        Download and install the Session Manager plugin:

        === ":material-debian: Debian / :material-ubuntu: Ubuntu"

            ```sh title="shell"
            curl -fsSL \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_arm64/session-manager-plugin.deb" \
                -o session-manager-plugin.deb

            sudo dpkg -i session-manager-plugin.deb
            ```

        === ":fontawesome-brands-aws: AL2 / :fontawesome-brands-redhat: RHEL 7"

            ```sh title="shell"
            sudo yum install -y \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_arm64/session-manager-plugin.rpm"
            ```

        === ":fontawesome-brands-aws: AL2023 / :fontawesome-brands-redhat: RHEL 8 & 9"

            ```sh title="shell"
            sudo dnf install -y \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_arm64/session-manager-plugin.rpm"
            ```


    === "x86-64"

        Download and install AWS CLI:

        ```sh title="shell"
        curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
            -o awscliv2.zip

        unzip awscliv2.zip
        sudo ./aws/install
        ```

        Download and install the Session Manager plugin:

        === ":material-debian: Debian / :material-ubuntu: Ubuntu"

            ```sh title="shell"
            curl -fsSL \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" \
                -o session-manager-plugin.deb

            sudo dpkg -i session-manager-plugin.deb
            ```

        === ":fontawesome-brands-aws: AL2 / :fontawesome-brands-redhat: RHEL 7"

            ```sh title="shell"
            sudo yum install -y \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm"
            ```

        === ":fontawesome-brands-aws: AL2023 / :fontawesome-brands-redhat: RHEL 8 & 9"

            ```sh title="shell"
            sudo dnf install -y \
                "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm"
            ```

## Setting up the AWS CLI

### Configuring SSO

Once you have installed the AWS CLI, you need to configure the Single Sign On (SSO) settings:

```sh title="shell"
aws configure sso
```

This will open an interactive prompt, enter these values:

```sh title="shell"
SSO session name (Recommended):
# This is a label that lets the AWS CLI reuse and distinguish login sessions.
# We recommend you use `rprlab` or similar.
rprlab

SSO start URL [None]:
# This is the URL for the access portal.
https://ssoins-6508293e3330524d.portal.eu-north-1.app.aws

SSO region: [None]:
# We are using the Stockholm region.
eu-north-1

SSO registration scopes [sso:account:access]:
# Press Enter to use the default. You will be asked to sign in.

CLI default client Region [None]:
# We are using the Stockholm region.
eu-north-1

CLI default output format (json if not specified) [None]:
# Press Enter to use the default

CLI profile name:
# This is a label that you will use to let the AWS CLI know you want to use
# this profile. We recommend you use `rprlab-research` or similar.
rprlab-research
```

### Logging in with SSO

Once you have set up the SSO configuration, you can log in:

```sh title="shell"
aws sso login --profile rprlab-research
```

!!! info "Info"

    SSO sessions are valid for up to 12 hours. Once your session expires, run this command again to re-authenticate with AWS.

#### Setting default profile

To avoid having to specify `--profile` with every AWS CLI command, you can set the `AWS_PROFILE` environment variable:

```sh
export AWS_PROFILE=rprlab-research
```

!!! info "Info"

    The examples shown throughout these docs will assume you have set this variable.

<br>

[Learn about EC2 instances](../researchers/ec2.md){ .md-button .md-button--primary }

<br>
