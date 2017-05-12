/*
 * Simple Arithmetics Grammar
 * ==========================
 *
 * Accepts expressions like "2 * (3 + 4)" and computes their value.
 */

 {

    function paren(s)
    {
        let v = s.trim();
        if (v === "String")
            return "t.String";

         if (v[0] === "[")
            return "t.list(" + paren(v.substr(1,v.length - 2)) + ")";

         if (v[0] === "(")
            return "t.tuple(" +
                    v.substr(1,v.length - 2)
                    	.split(/\s*,\s*/)
                        .map(paren)
                        .join(', ')
                        + ")";

         return v;
     }

 }

Fn "functionDecl"
  = "::" _ head:FnHead _ ":" _ domain:FnDomain _ coDomain:FnDomainBit {
   return Object.assign({
   		  domain, coDomain,
          isExported: true,
          isCurried: true,
        }, head );
  }

FnHead
  = declareAs:sym _ "=" _ implementer:sym {
  	return {declareAs, implementer};
  }
  / declareAs:sym { return {declareAs, implementer: declareAs + "_" }; }

Typ "type"
  = sym ( "." sym / "(" _  )*

FnDomain
  = (decl:FnDomainBit "->" { return decl; })*

FnDomainBit
  = s:$[^-\n\r]+ { return paren(s); }


sym = head:$[a-zA-Z_$] tail:$[a-zA-Z0-9_$]* { return head + tail; }

_ "whitespace"
  = [ \t\n\r]*

__ "whitespace req"
  = [ \t\n\r]+