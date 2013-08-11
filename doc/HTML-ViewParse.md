String: 
"I'm a {#if {#eque {{sex}}{{'woman'}} } }girl{#else}boy{/if{}}."
[
	"I'm a ",
	V.Handle["#if"]( [V.Handle["#eque"]( [V.Handle[""]("sex"),V.Handle[""]("'woman'")] )] ),
	"girl",
	V.Handle["else"](),
	"boy",
	V.Handle["/if"]([]),
	"."
]
"my name is {{fullName}}"
[
	"my name is ",
	V.Handle[""]("fullName"),//function with toString and valueOf
]
DOM:
/**/

"":for HTML
'':for javascript