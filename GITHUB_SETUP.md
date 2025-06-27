# GitHub Setup Manual

This manual provides step-by-step instructions for setting up GitHub branches, protection rules, and workflow configuration for the SubTrack project.

## 🏗️ Branch Strategy

### Branch Types

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - Feature development branches
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Release preparation branches

### Branch Flow

```
feature/xyz → develop → main
hotfix/xyz → main → develop
```

## 🔒 Branch Protection Rules

### 1. Main Branch Protection

**Settings → Branches → Add rule for `main`:**

#### Basic Settings

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **2**
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners
  - ✅ Allow specified actors to bypass required pull requests: **@pavlov**

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks that are required:
    - `quality` (Code Quality)
    - `test` (Unit Tests)
    - `e2e` (E2E Tests)
    - `build` (Build Check)
    - `security` (Security Scan)

#### Additional Rules

- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Include administrators**
- ✅ **Restrict pushes that create files that are larger than 100 MB**

### 2. Develop Branch Protection

**Settings → Branches → Add rule for `develop`:**

#### Basic Settings

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners
  - ✅ Allow specified actors to bypass required pull requests: **@pavlov**

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks that are required:
    - `quality` (Code Quality)
    - `test` (Unit Tests)
    - `build` (Build Check)

#### Additional Rules

- ✅ **Require conversation resolution before merging**
- ✅ **Include administrators**

## 🔧 Repository Settings

### 1. General Settings

**Settings → General:**

#### Repository Name

- Repository name: `SubTrack`
- Description: `Subscription tracking and management platform`

#### Features

- ✅ **Issues**
- ✅ **Discussions**
- ✅ **Wikis**
- ✅ **Allow forking**
- ✅ **Allow public access**

#### Pull Requests

- ✅ **Allow auto-merge**
- ✅ **Automatically delete head branches**

#### Merge Button

- ✅ **Allow merge commits**
- ✅ **Allow squash merging**
- ✅ **Allow rebase merging**
- ✅ **Default to squash merging**

### 2. Security Settings

**Settings → Security:**

#### Security Features

- ✅ **Dependency graph**
- ✅ **Dependabot alerts**
- ✅ **Dependabot security updates**
- ✅ **Code scanning**
- ✅ **Secret scanning**

#### Advanced Security

- ✅ **Push protection**
- ✅ **Require review for code scanning alerts**

### 3. Actions Settings

**Settings → Actions → General:**

#### Actions Permissions

- ✅ **Allow all actions and reusable workflows**
- ✅ **Allow GitHub Actions to create and approve pull requests**

#### Workflow Permissions

- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

## 🔑 Required Secrets

### 1. Repository Secrets

**Settings → Secrets and variables → Actions → New repository secret:**

#### Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_WORKOS_CLIENT_ID=your_workos_client_id
VITE_POSTHOG_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### CI/CD Secrets

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
CODECOV_TOKEN=your_codecov_token
SNYK_TOKEN=your_snyk_token
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 2. Environment Secrets

**Settings → Environments → Create environments:**

#### Production Environment

- Environment name: `production`
- Protection rules:
  - ✅ **Required reviewers**: **@pavlov**
  - ✅ **Wait timer**: **5 minutes**

#### Preview Environment

- Environment name: `preview`
- Protection rules:
  - ✅ **Required reviewers**: **@pavlov**

## 🏷️ Labels Setup

### 1. Issue Labels

**Issues → Labels → New label:**

#### Priority Labels

- `high-priority` - #d73a4a
- `medium-priority` - #fbca04
- `low-priority` - #0e8a16

#### Type Labels

- `bug` - #d73a4a
- `enhancement` - #1d76db
- `feature` - #1d76db
- `documentation` - #0075ca
- `good first issue` - #7057ff

#### Status Labels

- `needs-triage` - #fbca04
- `in-progress` - #1d76db
- `blocked` - #d73a4a
- `ready for review` - #0e8a16

#### Category Labels

- `frontend` - #1d76db
- `backend` - #d73a4a
- `ui/ux` - #fbca04
- `security` - #d73a4a
- `performance` - #0e8a16

#### Automated Labels

- `dependencies` - #0366d6
- `automated` - #7057ff
- `github-actions` - #0366d6
- `security` - #d73a4a

## 🔄 Workflow Configuration

### 1. Enable Actions

**Actions → General:**

#### Actions Permissions

- ✅ **Allow all actions and reusable workflows**
- ✅ **Allow GitHub Actions to create and approve pull requests**

#### Workflow Permissions

- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

### 2. Required Status Checks

**Settings → Branches → main → Edit:**

#### Status Checks

- `quality` (Code Quality)
- `test` (Unit Tests)
- `e2e` (E2E Tests)
- `build` (Build Check)
- `security` (Security Scan)

## 📋 Pull Request Templates

### 1. Template Location

The pull request template is located at `.github/pull_request_template.md`

### 2. Template Features

- ✅ **Type of change** selection
- ✅ **Description** field
- ✅ **Testing** checklist
- ✅ **Screenshots** section
- ✅ **Breaking changes** section
- ✅ **Checklist** for quality assurance

## 🔍 Code Review Process

### 1. Review Requirements

- **Main branch**: 2 approvals required
- **Develop branch**: 1 approval required
- **Code owners**: Automatic assignment based on `.github/CODEOWNERS`

### 2. Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## 🚀 Deployment Process

### 1. Preview Deployments

- **Trigger**: Pull requests to `main` or `develop`
- **Environment**: Preview environment
- **URL**: Automatically generated

### 2. Production Deployments

- **Trigger**: Merges to `main` branch
- **Environment**: Production environment
- **URL**: Production URL
- **Requirements**: All status checks must pass

## 📊 Monitoring and Analytics

### 1. Required Services

- **Codecov**: Code coverage reporting
- **Snyk**: Security vulnerability scanning
- **PostHog**: Analytics and feedback
- **Slack**: Notifications and alerts

### 2. Setup Instructions

#### Codecov Setup

1. Connect repository to Codecov
2. Add `CODECOV_TOKEN` secret
3. Configure coverage thresholds

#### Snyk Setup

1. Connect repository to Snyk
2. Add `SNYK_TOKEN` secret
3. Configure security policies

#### PostHog Setup

1. Create PostHog project
2. Add environment variables
3. Configure event tracking

#### Slack Setup

1. Create Slack app
2. Configure webhook URL
3. Add `SLACK_WEBHOOK_URL` secret

## 🔧 Troubleshooting

### Common Issues

#### 1. Status Checks Not Running

- Check Actions permissions
- Verify workflow files are in `.github/workflows/`
- Ensure secrets are properly configured

#### 2. Branch Protection Blocking Merges

- Verify required status checks are passing
- Check reviewer requirements
- Ensure code owner reviews are completed

#### 3. Deployment Failures

- Check environment secrets
- Verify deployment permissions
- Review deployment logs

### Support

- **GitHub Issues**: Create issues for workflow problems
- **GitHub Discussions**: Ask questions in discussions
- **Documentation**: Check project documentation

## 📚 Additional Resources

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

This setup ensures a robust, secure, and efficient development workflow for the SubTrack project. 🚀
