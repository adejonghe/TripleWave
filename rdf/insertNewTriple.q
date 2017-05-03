PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#>

WITH <[g]>
INSERT{
[insert_pattern]
}
WHERE {
  GRAPH <http://example/input>{
[select_pattern]
 } 
} 
