// noinspection JSUnusedGlobalSymbols

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#controls
 */

export enum HttpHeaders {

  /* *** Custom Headers *** */
  X_Opra_Version = 'X-Opra-Version',
  X_Opra_DataType = 'X-Opra-DataType',
  X_Opra_Count = 'X-Opra-Count',


  /* *** Authentication *** */

  /**
   * Defines the authentication method that should be used to access a resource.
   */
  WWW_Authenticate = 'WWW-Authenticate',

  /**
   * Contains the credentials to authenticate a user-agent with a server.
   */
  Authorization = 'Authorization',

  /**
   * Defines the authentication method that should be used to access a resource behind a proxy server.
   */
  Proxy_Authenticate = 'Proxy-Authenticate',

  /**
   * Contains the credentials to authenticate a user agent with a proxy server.
   */
  Proxy_Authorization = 'Proxy-Authorization',


  /* *** Caching *** */

  /**
   * The time, in seconds, that the object has been in a proxy cache.
   */
  Age = 'Age',

  /**
   * Directives for caching mechanisms in both requests and responses.
   */
  Cache_Control = 'Cache-Control',

  /**
   * Clears browsing data (e.g. cookies, storage, cache) associated with the requesting website.
   */
  Clear_Site_Data = 'Clear-Site-Data',

  /**
   * The date/time after which the response is considered stale.
   */
  Expires = 'Expires',

  /**
   * Implementation-specific header that may have various effects anywhere along the request-response chain.
   * Used for backwards compatibility with HTTP/1.0 caches where the Cache-Control header is not yet present.
   */
  Pragma = 'Pragma',


  /* *** Conditionals *** */

  /**
   * The last modification date of the resource, used to compare several versions of the same resource.
   * It is less accurate than ETag, but easier to calculate in some environments.
   * Conditional requests using If-Modified-Since and If-Unmodified-Since
   * use this value to change the behavior of the request.
   */
  Last_Modified = 'Last-Modified',

  /**
   * A unique string identifying the version of the resource.
   * Conditional requests using If-Match and If-None-Match use this value to change the behavior of the request.
   */
  ETag = 'ETag',

  /**
   * Makes the request conditional, and applies the method only if the stored resource matches one of the given ETags.
   */
  If_Match = 'If-Match',

  /**
   * Makes the request conditional, and applies the method only if the stored resource doesn't match
   * any of the given ETags. This is used to update caches (for safe requests), or to prevent uploading
   * a new resource when one already exists.
   */
  If_None_Match = 'If-None-Match',

  /**
   * Makes the request conditional, and expects the resource to be transmitted only if it has been modified
   * after the given date. This is used to transmit data only when the cache is out of date.
   */
  If_Modified_Since = 'If-Modified-Since',

  /**
   * Makes the request conditional, and expects the resource to be transmitted only if
   * it has not been modified after the given date. This ensures the coherence of a new
   * fragment of a specific range with previous ones, or to implement an optimistic
   * concurrency control system when modifying existing documents.
   */
  If_Unmodified_Since = 'If-Unmodified-Since',

  /**
   * Determines how to match request headers to decide whether a cached response can be used
   * rather than requesting a fresh one from the origin server.
   */
  Vary = 'Vary',


  /* *** Connection management *** */

  /**
   * Controls whether the network connection stays open after the current transaction finishes.
   */
  Connection = 'Connection',

  /**
   * Controls how long a persistent connection should stay open.
   */
  Keep_Alive = 'Keep-Alive',

  // Content negotiation

  /**
   * Informs the server about the types of data that can be sent back.
   */
  Accept = 'Accept',

  /**
   * The encoding algorithm, usually a compression algorithm, that can be used on the resource sent back.
   */
  Accept_Encoding = 'Accept-Encoding',

  /**
   * Informs the server about the human language the server is expected to send back.
   * This is a hint and is not necessarily under the full control of the user:
   * the server should always pay attention not to override an explicit user choice
   * (like selecting a language from a dropdown).
   */
  Accept_Language = 'Accept-Language',


  /* *** Controls *** */

  /**
   * Indicates expectations that need to be fulfilled by the server to properly handle the request.
   */
  Expect = 'Expect',


  /* *** Cookies *** */

  /**
   * Contains stored HTTP cookies previously sent by the server with the Set-Cookie header.
   */
  Cookie = 'Cookie',

  /**
   * Send cookies from the server to the user-agent.
   */
  Set_Cookie = 'Set-Cookie',


  /* *** CORS *** */

  /**
   * Indicates whether the response can be shared.
   */
  Access_Control_Allow_Origin = 'Access-Control-Allow-Origin',

  /**
   * Indicates whether the response to the request can be exposed when the credentials flag is true.
   */
  Access_Control_Allow_Credentials = 'Access-Control-Allow-Credentials',

  /**
   * Used in response to a preflight request to indicate which HTTP headers can be used when making the actual request.
   */
  Access_Control_Allow_Headers = 'Access-Control-Allow-Headers',

  /**
   * Specifies the methods allowed when accessing the resource in response to a preflight request.
   */
  Access_Control_Allow_Methods = 'Access-Control-Allow-Methods',

  /**
   * Indicates which headers can be exposed as part of the response by listing their names.
   */
  Access_Control_Expose_Headers = 'Access-Control-Expose-Headers',

  /**
   * Indicates how long the results of a preflight request can be cached.
   */
  Access_Control_Max_Age = 'Access-Control-Max-Age',

  /**
   * Used when issuing a preflight request to let the server know which HTTP headers will be
   * used when the actual request is made.
   */
  Access_Control_Request_Headers = 'Access-Control-Request-Headers',

  /**
   * Used when issuing a preflight request to let the server know which HTTP method
   * will be used when the actual request is made.
   */
  Access_Control_Request_Method = 'Access-Control-Request-Method',

  /**
   * Indicates where a fetch originates from.
   */
  Origin = 'Origin',

  /**
   * Specifies origins that are allowed to see values of attributes retrieved via features of the Resource Timing API,
   * which would otherwise be reported as zero due to cross-origin restrictions.
   */
  Timing_Allow_Origin = 'Timing-Allow-Origin',


  /* *** Downloads *** */

  /**
   * Indicates if the resource transmitted should be displayed inline (default behavior without the header),
   * or if it should be handled like a download and the browser should present a "Save As" dialog.
   */
  Content_Disposition = 'Content-Disposition',


  /* *** Message body information *** */

  /**
   * Indicates to uniquely identifies MIME entities in several contexts.
   */
  Content_ID = 'Content-ID',

  /**
   * The size of the resource, in decimal number of bytes.
   */
  Content_Length = 'Content-Length',

  /**
   * Indicates the media type of the resource.
   */
  Content_Type = 'Content-Type',

  /**
   * Indicates to specify how a MIME message or body part has been encoded,
   * so that it can be decoded by its recipient.
   */
  Content_Transfer_Encoding = 'Content-Transfer-Encoding',

  /**
   * Used to specify the compression algorithm.
   */
  Content_Encoding = 'Content-Encoding',

  /**
   * Describes the human language(s) intended for the audience, so that it allows a user to
   * differentiate according to the users' own preferred language.
   */
  Content_Language = 'Content-Language',

  /**
   * Indicates an alternate location for the returned data.
   */
  Content_Location = 'Content-Location',

  // Proxies

  /**
   * Contains information from the client-facing side of proxy servers that is altered or
   * lost when a proxy is involved in the path of the request.
   */
  Forwarded = 'Forwarded',

  /**
   * Identifies the originating IP addresses of a client connecting to a web server
   * through an HTTP proxy or a load balancer.
   */
  X_Forwarded_For = 'X-Forwarded-For',

  /**
   * Identifies the original host requested that a client used to connect to your proxy or load balancer.
   */
  X_Forwarded_Host = 'X-Forwarded-Host',

  /**
   * Identifies the protocol (HTTP or HTTPS) that a client used to connect to your proxy or load balancer.
   */
  X_Forwarded_Proto = 'X-Forwarded-Proto',

  /**
   * Added by proxies, both forward and reverse proxies, and can appear in the request headers and the response headers.
   */
  Via = 'Via',


  /* *** Redirects *** */

  /**
   * Indicates the URL to redirect a page to.
   */
  Location = 'Location',


  /* *** Request context *** */

  /**
   * Contains an Internet email address for a human user who controls the requesting user agent.
   */
  From = 'From',

  /**
   * Specifies the domain name of the server (for virtual hosting), and (optionally)
   * the TCP port number on which the server is listening.
   */
  Host = 'Host',

  /**
   * The address of the previous web page from which a link to the currently requested page was followed.
   */
  Referer = 'Referer',

  /**
   * Governs which referrer information sent in the Referer header should be included with requests made.
   */
  Referrer_Policy = 'Referrer-Policy',

  /**
   * Contains a characteristic string that allows the network protocol peers to identify the application type,
   * operating system, software vendor or software version of the requesting software user agent.
   */
  User_Agent = 'User-Agent',


  /* *** Response context *** */

  /**
   * Lists the set of HTTP request methods supported by a resource.
   */
  Allow = 'Allow',

  /**
   * Contains information about the software used by the origin server to handle the request.
   */
  Server = 'Server',


  /* *** Range requests *** */

  /**
   * Indicates if the server supports range requests, and if so in which unit the range can be expressed.
   */
  Accept_Ranges = 'Accept-Ranges',

  /**
   * Indicates the part of a document that the server should return.
   */
  Range = 'Range',

  /**
   * Creates a conditional range request that is only fulfilled if the given etag or date matches
   * the remote resource. Used to prevent downloading two ranges from incompatible version of the resource.
   */
  If_Range = 'If-Range',

  /**
   * Indicates where in a full body message a partial message belongs.
   */
  Content_Range = 'Content-Range',


  /* *** Security *** */

  /**
   * Allows a server to declare an embedder policy for a given document.
   */
  Cross_Origin_Embedder_Policy = 'Cross-Origin-Embedder-Policy',

  /**
   * Prevents other domains from opening/controlling a window.
   */
  Cross_Origin_Opener_Policy = 'Cross-Origin-Opener-Policy',

  /**
   * Prevents other domains from reading the response of the resources to which this header is applied.
   */
  Cross_Origin_Resource_Policy = 'Cross-Origin-Resource-Policy',

  /**
   * Controls resources the user agent is allowed to load for a given page.
   */
  Content_Security_Policy = 'Content-Security-Policy',

  /**
   * Allows web developers to experiment with policies by monitoring, but not enforcing, their effects.
   * These violation reports consist of JSON documents sent via an HTTP POST request to the specified URI.
   */
  Content_Security_Policy_Report_Only = 'Content-Security-Policy-Report-Only',

  /**
   * Allows sites to opt in to reporting and/or enforcement of Certificate Transparency requirements,
   * which prevents the use of misissued certificates for that site from going unnoticed.
   * When a site enables the Expect-CT header, they are requesting that Chrome check that
   * any certificate for that site appears in public CT logs.
   */
  Expect_CT = 'Expect-CT',

  /**
   * Provides a mechanism to allow and deny the use of browser features in its own frame,
   * and in iframes that it embeds.
   */
  Feature_Policy = 'Feature-Policy',

  /**
   * Force communication using HTTPS instead of HTTP.
   */
  Strict_Transport_Security = 'Strict-Transport-Security',

  /**
   * Sends a signal to the server expressing the client's preference for an encrypted and authenticated response,
   * and that it can successfully handle the upgrade-insecure-requests directive.
   */
  Upgrade_Insecure_Requests = 'Upgrade-Insecure-Requests',

  /**
   * Disables MIME sniffing and forces browser to use the type given in Content-Type.
   */
  X_Content_Type_Options = 'X-Content-Type-Options',

  /**
   * The X-Download-Options HTTP header indicates that the browser (Internet Explorer)
   * should not display the option to "Open" a file that has been downloaded from an application,
   * to prevent phishing attacks as the file otherwise would gain access to execute in the context of the application.
   */
  X_Download_Options = 'X-Download-Options',

  /**
   * Indicates whether a browser should be allowed to render a page in a <frame>, <iframe>, <embed> or <object>.
   */
  X_Frame_Options = 'X-Frame-Options',

  /**
   * Specifies if a cross-domain policy file (crossdomain.xml) is allowed.
   * The file may define a policy to grant clients, such as Adobe's Flash Player (now obsolete),
   * Adobe Acrobat, Microsoft Silverlight (now obsolete), or Apache Flex,
   * permission to handle data across domains that would otherwise be restricted
   * due to the Same-Origin Policy. See the Cross-domain Policy File Specification for more information.
   */
  X_Permitted_Cross_Domain_Policies = 'X-Permitted-Cross-Domain-Policies',

  /**
   * May be set by hosting environments or other frameworks and contains information about
   * them while not providing any usefulness to the application or its visitors.
   * Unset this header to avoid exposing potential vulnerabilities.
   */
  X_Powered_By = 'X-Powered-By',

  /**
   * Enables cross-site scripting filtering.
   */
  X_XSS_Protection = 'X-XSS-Protection',


  /* *** Transfer coding *** */

  /**
   * Specifies the form of encoding used to safely transfer the resource to the user.
   */
  Transfer_Encoding = 'Transfer-Encoding',

  /**
   * Specifies the transfer encodings the user agent is willing to accept.
   */
  TE = 'TE',

  /**
   * Allows the sender to include additional fields at the end of chunked message.
   */
  Trailer = 'Trailer',


  /* *** WebSockets *** */

  Sec_WebSocket_Key = 'Sec-WebSocket-Key',
  Sec_WebSocket_Extensions = 'Sec-WebSocket-Extensions',
  Sec_WebSocket_Accept = 'Sec-WebSocket-Accept',
  Sec_WebSocket_Protocol = 'Sec-WebSocket-Protocol',
  Sec_WebSocket_Version = 'Sec-WebSocket-Version',


  /* *** Other *** */

  /**
   * Contains the date and time at which the message was originated.
   */
  Date = 'Date',

  /**
   * Indicates how long the user agent should wait before making a follow-up request.
   */
  Retry_After = 'Retry-After',

  /**
   * Communicates one or more metrics and descriptions for the given request-response cycle.
   */
  Server_Timing = 'Server-Timing',

  /**
   * Controls DNS prefetching, a feature by which browsers proactively perform domain name
   * resolution on both links that the user may choose to follow as well as URLs for items
   * referenced by the document, including images, CSS, JavaScript, and so forth.
   */
  X_DNS_Prefetch_Control = 'X-DNS-Prefetch-Control'

}
