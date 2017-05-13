/*
 * Simple Arithmetics Grammar
 * ==========================
 *
 * Accepts expressions like "2 * (3 + 4)" and computes their value.
 */

 {



function fnCall(name, args) {
    let o = "// " + JSON.stringify(args) + "\n";
	return name + "(" + args.join(", ") + ")";
}

function unpackList(paren) {
  return paren.length === 1
  	? paren[0]
    : fnCall(paren[0], paren.slice(1));
}


function signatureToFn(e,indent='    ') {

	let prefix = '\n' + indent + indent + indent;
    	return ' t.func(' + prefix + "[ " +
        	e.domain.join(prefix + ', ' ) +

            prefix + ']' +
            prefix + ', '+ e.coDomain +

           // (e.isCurried ? prefix + ', ' +  'true // curry' : '') +

            ');' +
            '\n';
}

function toTypeMap(fns,indent='    ') {

	let body = fns.map(fn => indent + fn.declareAs + ":" + signatureToFn(fn, indent));
	return "let Types = {\n" + body.join("\n\n") + "\n};";
}

}

Fn "Functions"
  = r:(f:FnDecl _ {return f;})* {return toTypeMap(r,'\t');}


FnDecl "functionDecl"
  = "::" _ head:FnHead _ ":" _ s:FnSignature {
  //return "\nTypes." + head.declareAs + " =\n" + signatureToFn(s)
   return Object.assign({
          isExported: true,

        }, s, head );
  }

FnHead
  = declareAs:sym _ "=" _ implementer:sym {
  	return {declareAs, implementer};
  }
  / declareAs:sym { return {declareAs, implementer: declareAs + "_" }; }

FnSignature
 = domain:FnDomain _ coDomain:FnDomainBit {
 		return {domain, coDomain, isCurried: true};
   }

FnDomain
  = (decl:FnDomainBit "->" _ { return decl; })*

FnDomainBit
	= decl:typeExpr* {
  		return unpackList(decl); }

typeExpr
	= b:builtin _ { return b; }
    / pa:pathExpr paren:parenExpr _ { return fnCall(pa, paren); }
    / paren:parenExpr _ { return unpackList(paren); }
    / path:pathExpr _ { return path; }
    / '(' _ e:FnSignature ')' _ {
    	return 't.func([ ' +
        	e.domain.join(', ') + ' ], ' +
            e.coDomain +  ', ' +
            (e.isCurried ? 'true' : 'false') + ')';
    }




pathExpr =
	head:sym p:("." p:sym {return p})*
     {
        return [head].concat(p).join('.');
    	return tail.reduce((memo,t) => fnCall(memo, [t]), path );
    }

parenExpr =
	'(' _ v:(t:typeExpr [ \r\n,]* {return t;})* ')' {
    return v;
	//return v.join(', ');
}

builtin
	= "String" { return "t.String" }
    / ("*" / "Any" ) { return "t.Any" }

    /  "Tuple"  { return "t.tuple"; }

    / ("?"  / "Maybe" ![\w])  { return "t.maybe"; }
    / ("[]"  / "List" ![\w]) { return "t.list"; }


sym "Symbol"
  =	head:$[a-zA-Z_$] tail:$[a-zA-Z0-9_$]* { return head + tail; }

_ "whitespace"
  = [ \t\n\r,]*

__ "req whitespace"
  = [ \t\n\r,]+


