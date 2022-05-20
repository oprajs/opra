grammar OWOFilter;

root
    : expression EOF
    ;

/****************************************************************
    Expressions
*****************************************************************/

expression
    : term                                                      #termExpression
    | polarOp expression                                        #polarityExpression
//    | invocable '.' invocation                        #invocationExpression
//    | invocable '[' indexer ']'                       #indexerExpression
    | expression arthOp expression                              #arithmeticExpression
    | expression compOp expression                              #comparisonExpression
    | expression logOp expression                               #logicalExpression
    | '(' expression ')'                                        #parenthesizedExpression
    | '[' expression (',' expression)* ']'                      #arrayExpression
    ;


/****************************************************************
* Terms
*
* The term production rule defines the syntax for
* core expression terms within OWO filter
*****************************************************************/

term
    : literal                                   #literalTerm
    | qualifiedIdentifier                       #qualifiedIdentifierTerm
    | externalConstant                          #externalConstantTerm
//    | function                                  #functionTerm
//    | invocation                                #invocationTerm
    ;

invocable
   : function
   ;

invocation                          // Terms that can be used after the function/member invocation '.'
    : identifier                                            #memberInvocation
//    | function                                              #functionInvocation
    ;

indexer
    : identifier                                            #memberIndex
    | INTEGER                                               #numberIndex
    ;


function
        : identifier '(' paramList? ')'
        ;

paramList
        : expression (',' expression)*
        ;

unit
    : dateTimePrecision
    | pluralDateTimePrecision
    | STRING // UCUM syntax for units of measure
    ;

dateTimePrecision
        : 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
        ;

pluralDateTimePrecision
        : 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
        ;

qualifiedIdentifier
        : (identifier '.')* identifier
        ;

externalConstant
        : '@' ( IDENTIFIER | STRING )
        ;

identifier
    : IDENTIFIER
    ;

literal
    : NUMBER                                                #numberLiteral
    | infinity                                              #infinityLiteral
    | boolean                                               #booleanLiteral
    | null                                                  #nullLiteral
    | DATE                                                  #dateLiteral
    | DATETIME                                              #dateTimeLiteral
    | TIME                                                  #timeLiteral
    | STRING                                                #stringLiteral
    ;

compOp
    : '<=' | '<' | '>' | '>=' | '=' | '!=' | 'in' | '!in' | 'like' | '!like'| 'ilike' | '!ilike'
    ;

arthOp
    : '+' | '-' | '*' | '/'
    ;

polarOp
    : '+' | '-'
    ;

logOp
    :'and' | 'or'
    ;

boolean
   : 'true' | 'false'
   ;

null
   : 'null'
   ;

infinity
   : 'infinity'
   ;

/****************************************************************
* Lexer Rules
*
* The lexer rules define the terminal production rules
*****************************************************************/

DATE
    : '\'' DATEFORMAT '\''
    | '"' DATEFORMAT '"'
    ;

DATETIME
    : '\'' DATEFORMAT 'T' TIMEFORMAT TIMEZONEOFFSETFORMAT '\''
    | '"' DATEFORMAT 'T' TIMEFORMAT TIMEZONEOFFSETFORMAT '"'
    ;

TIME
    : '\'' TIMEFORMAT '\''
    | '"' TIMEFORMAT '"'
    ;

IDENTIFIER
    : ([A-Za-z$_])([A-Za-z0-9_$])*
    ;

STRING
    : '\'' (ESC | ~['])* '\''
    | '"' (ESC | ~["])* '"'
    ;

NUMBER
    : NUMBERFORMAT
    ;

INTEGER
    : INTEGERFORMAT
    ;


// Pipe whitespace to the HIDDEN channel to support retrieving source text through the parser.
WHITESPACE
    : [ \r\n\t]+ -> channel(HIDDEN)
    ;

COMMENT
    : '/*' .*? '*/' -> channel(HIDDEN)
    ;

LINE_COMMENT
    : '//' ~[\r\n]* -> channel(HIDDEN)
    ;

fragment NUMBERFORMAT
   : [0-9]+('.' [0-9]+)?
   ;

fragment INTEGERFORMAT
   : [0-9]
   ;

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

