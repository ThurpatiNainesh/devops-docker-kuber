# Connect to AWS EC2 Instance Using SSH

### Step 1: Create SSH directory
Create a directory to store your SSH private keys.

```bash
mkdir -p ~/.ssh
```

### Step 2: Move PEM file
Move the downloaded AWS private key into the SSH directory.

```bash
mv ~/Downloads/BelovedCompanion.pem ~/.ssh/
```

### Step 3: Set file permissions
Restrict access to the private key. SSH requires the key to be accessible only by its owner.

```bash
chmod 400 ~/.ssh/BelovedCompanion.pem
```

### Step 4: Connect to EC2
Connect to your AWS EC2 instance using its private key and public IP.

```bash
ssh -i ~/.ssh/BelovedCompanion.pem ubuntu@15.135.120.217
```

### What each part means

| Command / Value | Purpose |
|---|---|
| `ssh` | Connect to a remote server |
| `-i` | Specify private key file |
| `BelovedCompanion.pem` | AWS private key |
| `ubuntu` | EC2 username (Ubuntu AMI) |
| `15.135.120.217` | EC2 public IP |

### Important Notes
- Never share your `.pem` private key.
- Never upload it to GitHub.
- `chmod 400` gives read permission only to the file owner.
- Make sure EC2 Security Group allows inbound SSH (port 22) from your IP.

**Successfully connected!** You can now execute Linux commands on your EC2 instance.