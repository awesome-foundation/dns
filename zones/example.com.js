// Author: Luka Kladaric @allixsenos

// set manage_redirects to true to enable redirect management via Page Rules
// set to false or remove to disable redirect management via Page Rules
var DNS_CFLARE = NewDnsProvider("cloudflare", {"manage_redirects": true});

D("example.com", NewRegistrar("none"), DnsProvider(DNS_CFLARE),
	DefaultTTL(1), // Cloudflare special "auto TTL" https://docs.dnscontrol.org/service-providers/providers/cloudflareapi#cloudflare-special-ttls

    // EXAMPLE: SPF record to allow Google to send email on behalf of your domain
	TXT("@", "v=spf1 include:_spf.google.com -all"),

	// EXAMPLE: website is hosted on GitHub Pages
	ALIAS("@", "myusername.github.io.", CF_PROXY_ON), // domain apex has to be ALIAS, not CNAME, on Cloudflare
	CNAME("www", "myusername.github.io.", CF_PROXY_ON),

    // EXAMPLE: redirect wip site to main site
    CNAME("wip", "myusername.github.io.", CF_PROXY_ON), // this can be pointed at anything, as long as CF_PROXY_ON is set, otherwise the redirect won't work
    CF_REDIRECT("wip.example.com/*", "https://example.com/$1"), // redirect all paths under wip.example.com to example.com

    // EXAMPLE: verification records
	TXT("@", "google-site-verification=asdfblahblah"),
	TXT("@", "google-gws-recovery-domain-verification=asdfblahblah"),
	TXT("_github-pages-challenge-allixsenos", "asdfblahblah"),

    // G Suite setup
    MX('@', 1, 'smtp.google.com.'),
	TXT("google._domainkey", "v=DKIM1; k=rsa; p=asdfblahblah"),

	END  // alias to fix trailing comma issue because javascript is a silly language choice for a configuration file
)
