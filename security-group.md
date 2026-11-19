# Security Groups in Amazon EC2

A **Security Group (SG)** is a virtual firewall that controls inbound and outbound traffic for EC2 instances. It operates at the **instance level**. Strictly speaking, it is attached to the instance's Elastic Network Interface (ENI).

---

## Key Characteristics

- **Stateful:** if inbound traffic is allowed, the response traffic is automatically allowed out (and vice versa). You don't need matching return rules.
- **Allow rules only:** you cannot create "deny" rules. Anything not explicitly allowed is blocked.
- **Default behavior:** a new SG blocks all inbound traffic and allows all outbound traffic.
- **Multiple SGs per instance:** rules from all attached SGs are combined, and the union of all allow rules applies.
- **Reusable:** one SG can be attached to many instances.
- **VPC-scoped:** an SG belongs to a single VPC and region.
- **Immediate effect:** rule changes apply instantly, with no instance restart required.

---

## Rule Components

| Field | Description | Examples |
|---|---|---|
| Type / Protocol | Traffic protocol | TCP, UDP, ICMP, All |
| Port Range | Port(s) to allow | `22` (SSH), `80` (HTTP), `443` (HTTPS), `3306` (MySQL) |
| Source (inbound) / Destination (outbound) | Where traffic comes from or goes to | `0.0.0.0/0`, `203.0.113.5/32`, prefix list, another SG |
| Description | Optional note for the rule | `Allow HTTPS from internet` |

---

## Referencing Other Security Groups

Instead of IP addresses, a rule can allow traffic from instances that belong to another SG. This is the standard pattern for multi-tier architectures:

```
Internet ──► web-sg (80, 443 from 0.0.0.0/0)
               │
               ▼
             app-sg (8080 from web-sg)
               │
               ▼
             db-sg  (3306 from app-sg)
```

---

## Security Group vs Network ACL

| Security Group | Network ACL (NACL) |
|---|---|
| Operates at the instance (ENI) level | Operates at the subnet level |
| Stateful | Stateless |
| Allow rules only | Allow and Deny rules |
| All rules evaluated together | Rules evaluated in number order (lowest first) |
| Applies only to instances it's attached to | Applies to all instances in the subnet |

---

## Example: AWS CLI

```bash
# Create a security group
aws ec2 create-security-group \
  --group-name web-sg \
  --description "Web server security group" \
  --vpc-id vpc-xxxxxxxx

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow SSH only from your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp --port 22 --cidr 203.0.113.5/32

# Allow MySQL only from another security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-db-xxxxxxxx \
  --protocol tcp --port 3306 --source-group sg-app-xxxxxxxx
```

---

## Best Practices

- Never open SSH (`22`) or RDP (`3389`) to `0.0.0.0/0`. Restrict them to known IPs, or use **AWS Systems Manager Session Manager**.
- Follow **least privilege**: open only the ports you need.
- Use **SG references** instead of hard-coded IPs between application tiers.
- Use clear names and descriptions (e.g., `web-sg`, `app-sg`, `db-sg`).
- Periodically audit and remove unused rules and SGs.
- Restrict outbound traffic where your compliance requirements demand it.

---

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| Connection **times out** | Missing SG inbound rule (or NACL / route table issue) |
| Connection **refused** | Port is allowed, but the application isn't listening on it |
| Works from one IP, not another | Source CIDR in the rule is too narrow |