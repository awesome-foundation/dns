# DNS management with dnscontrol

This repository contains the DNS zones for domains managed with [dnscontrol](https://github.com/StackExchange/dnscontrol) by StackExchange.

It uses Github Actions to execute everything and requires no installation on your local machine. You can even manage your DNS directly on github using the web based editor.

Opening a PR will run `dnscontrol check` to perform a syntax check, followed by a `dnscontrol preview` to compare the file contents with the real world and produce a report of changes that will be executed. The report is then posted as a comment on the PR for inspection.

Merging the PR to master will execute `dnscontrol push` which will sync the managed zones to the state found in the files.

The actual DNS services used for each zone are queried for the state on each command.

Any changed to the DNS that are not tracked in the files will be overwritten on the next deploy.

## Importing an existing zone

The easiest way to import zones is using the Import workflow:

1. Go to Actions → "Import zones from Cloudflare" → "Run workflow"
2. The workflow will fetch all zones from your Cloudflare account and create a PR
3. Review the PR and discard any zone files you don't wish to manage
4. Merge the PR to start managing those zones

### Manually importing zones

To import a single zone locally:

```
export CLOUDFLARE_APITOKEN=asdfblahblah
dnscontrol get-zone --format=js cloudflare - mydomain.com > zones/mydomain.com.js
```

To import ALL zones from your account to their individual zone files:

```
dnscontrol get-zone --format=nameonly cloudflare - all | xargs -n1 -I@ dnscontrol get-zone --format=js --out zones/@.js cloudflare - @
```

To import just newly added zones that are not yet managed via this repository:

```
dnscontrol get-zone --format=nameonly cloudflare - all | sort > all_zones.list
ls zones/*.js | sed 's|zones/||' | sed 's|.js$||' | sort > managed_zones.list
comm -23 all_zones_sorted.list managed_zones.list  | xargs -n1 -I@ dnscontrol get-zone --format=js --out zones/@.js cloudflare - @
rm *.list
```

## Technical implementation details

Use the `zones/` folder to keep your DNS zones.

By convention, each file is named `domain.name.js` and only contains a single zone, but the filename has no special meaning and nothing bad happens if you name it something else. Similarly, nothing bad happens if you put multiple zones in one file.

The credentials are defined as Github Actions Secrets.

## Cloudflare setup

1. Create an API token
   1. Go to your Cloudflare dash -> Manage Account -> Account API Tokens https://dash.cloudflare.com/?to=/:account/api-tokens
   2. Create an Account Owned Token (User API Tokens won't work with Single Redirect APIs)
   3. Give it a useful name
   4. Give it the following permissions
       * Zone -> Zone -> Read
       * Zone -> DNS -> Edit
       * Zone -> Single Redirect -> Edit
   5. Scope it to specific zones, or the entire account, or however you see fit
2. Add the newly created token as a Github Actions Repository Secret, under name `CLOUDFLARE_APITOKEN`
3. Done

## Why not Terraform?

This got raised enough times that I wrote up an explanation, but would love to hear what people think. Head over to [the Why not Terraform? discussion](https://github.com/awesome-foundation/dns/discussions/3)

## Alternatives

This is going to be a growing list so let's keep it centralized. Please bring all your alternatives to the [Alternatives discussion](https://github.com/awesome-foundation/dns/discussions/4).

## Using a new provider

DNSControl supports many providers, and there will be zero effort to support or document any of them except for Cloudflare which by pure coincidence is the one I use.

Unfortunately, any new credentials will need to be added in 3 places:
1. Github Actions Repository Secrets
2. `creds.json` where you just reference the environment variable name in the config block for your provider
3. `.github/workflows/deploy.yml` and `preview.yml` where they are passed into the `push` and `preview` commands

There does not appear to be a way to configure dnscontrol entirely through envvars, and there does not seem to be a way to expose all (including future) secrets to a job without some significant security risks.

## Testing locally on Mac

```
brew install dnscontrol
export CLOUDFLARE_APITOKEN=xyz123
dnscontrol check
dnscontrol preview
dnscontrol push
```

## Who built this?

Luka Kladaric aka [Chaos Guru](https://chaos.guru/?utm_source=gh-af-dns) built this because dnscontrol is awesome but getting the PR previews and stuff to work takes a ton of trial and error and I always wished there was a turn key solution.
