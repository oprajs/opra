grammar OpraFilter;

root
    : expression EOF
    ;

expression
    : left=comparisonLeft
        operator=comparisonOperator
         right=comparisonRight                                #comparisonExpression
    | expression op=logicalOperator expression                #logicalExpression
    | '(' parenthesizedItem ')'                               #parenthesizedExpression
    | ('not' | '!') expression                                #negativeExpression
    ;

comparisonLeft
   : qualifiedIdentifier
   ;

comparisonRight
   : value
   | qualifiedIdentifier
   | externalConstant
   | arrayValue
   ;

parenthesizedItem
   : expression
   ;


value
    : NUMBER                                                #numberLiteral
    | infinity                                              #infinityLiteral
    | boolean                                               #booleanLiteral
    | null                                                  #nullLiteral
    | DATETIME                                              #dateTimeLiteral
    | DATE                                                  #dateLiteral
    | TIME                                                  #timeLiteral
    | STRING                                                #stringLiteral
    ;

qualifiedIdentifier
        : (identifier '.')* identifier
        ;

externalConstant
        : '@' identifier
        ;

identifier
    : IDENTIFIER
    ;


arrayValue
    : '[' value (',' value)* ']'
    ;

boolean
   : 'true' | 'false'
   ;

null
   : 'null'
   ;


infinity
   : 'Infinity' | 'infinity'
   ;


arithmeticOperator
    : '+' | '-' | '*' | '/'
    ;

comparisonOperator
   : '<=' | '<' | '>' | '>=' | '=' | '!=' | 'in' | '!in' | 'like' | '!like'| 'ilike' | '!ilike'
   ;

logicalOperator
    : 'and' | 'or' | '&&' | '||'
    ;

polarityOperator
    : POLAR_OP
    ;


/****************************************************************
* Lexer Rules
*
* The lexer rules define the terminal production rules
*****************************************************************/


IDENTIFIER
    : ([A-Za-z$_])([A-Za-z0-9_$])*
    ;


POLAR_OP
    : '+' | '-'
    ;

DATE
    : '\'' DATEFORMAT '\''
    | '"' DATEFORMAT '"'
    ;

DATETIME
    : '\'' DATEFORMAT 'T' TIMEFORMAT TIMEZONEOFFSETFORMAT '\''
    '\'' DATEFORMAT ' ' TIMEFORMAT TIMEZONEOFFSETFORMAT '\''
    '\'' DATEFORMAT 'T' TIMEFORMAT '\''
    '\'' DATEFORMAT ' ' TIMEFORMAT '\''
    | '"' DATEFORMAT 'T' TIMEFORMAT TIMEZONEOFFSETFORMAT '"'
    | '"' DATEFORMAT ' ' TIMEFORMAT TIMEZONEOFFSETFORMAT '"'
    | '"' DATEFORMAT 'T' TIMEFORMAT '"'
    | '"' DATEFORMAT ' ' TIMEFORMAT '"'
    ;

TIME
    : '\'' TIMEFORMAT '\''
    | '"' TIMEFORMAT '"'
    ;

NUMBER
    : POLAR_OP? DIGIT+ ('.' DIGIT*)? ('E' [-+]? DIGIT+)? | ('0x' HEX+)
    ;

INTEGER
    : POLAR_OP? (DIGIT+) | ('0x' HEX+)
    ;

STRING
    : '\'' (ESC | ~['])* '\''
    | '"' (ESC | ~["])* '"'
    ;



// Pipe whitespace to the HIDDEN channel to support retrieving source text through the parser.
WHITESPACE
    : [ \r\n\t]+ -> channel(HIDDEN)
    ;

fragment DIGIT:     [0-9];


fragment DATEFORMAT
    : [0-9][0-9][0-9][0-9] '-' ([0][1-9]|[1][012]) '-' ([123][0]|[012][1-9]|'31')
    ;

fragment TIMEFORMAT
    : ([01][0-9] | '2'[0-3]) ':' ([0-5][0-9]) (':'([0-5][0-9]) ('.'([0-9]+))?)?
    ;

fragment TIMEZONEOFFSETFORMAT
    : 'Z' | [+-] ([01]?[0-9] | '2'[0-3]) (':' ([0-5][0-9]))?
    ;

fragment ESC
    : '\\' (UNICODE | . )    // allow \`, \', \\, \/, \f, etc. and \uXXX
    ;

fragment UNICODE
    : 'u' HEX HEX HEX HEX
    ;

fragment HEX
    : [0-9a-fA-F]
    ;

