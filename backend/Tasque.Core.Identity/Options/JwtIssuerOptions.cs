﻿namespace Tasque.Core.Identity.Options
{
    public class JwtIssuerOptions
    {
        public string Issuer { get; set; } = null!;
        
        public string Audience { get; set; } = null!;
        
        public string Key { get; set; } = null!;
        
        public int ValidFor { get; set; }
    }
}
