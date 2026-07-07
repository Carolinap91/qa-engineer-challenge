@api
Feature: PokeAPI - Berry flavor endpoint
  Como consumidor de la PokeAPI quiero validar el endpoint /berry-flavor/{id or name}/
  y encadenar información entre endpoints.

  Scenario: Consultar berry-flavor por nombre válido
    When solicito el berry-flavor con nombre "spicy"
    Then la respuesta debería tener status 200
    And el body debería contener la lista de berries con sabor "spicy"

  Scenario: Encontrar la berry "spicy" con mayor potencia y validarla
    Given que obtuve la lista de berries con sabor "spicy"
    When identifico la berry con el valor de "potency" más alto
    And solicito esa berry por nombre al endpoint /berry/{id or name}/
    Then la respuesta debería tener status 200
    And el body debería corresponder a la berry identificada
