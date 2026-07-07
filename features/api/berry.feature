@api
Feature: PokeAPI - Berry endpoint
  Como consumidor de la PokeAPI quiero validar el endpoint /berry/{id or name}/
  para casos positivos y negativos.

  Scenario: Consultar berry por id válido
    When solicito el berry con id "1"
    Then la respuesta debería tener status 200
    And el body debería contener el nombre de la berry esperado

  Scenario: Consultar berry por id inválido
    When solicito el berry con id "99999"
    Then la respuesta debería tener status 404

  Scenario: Consultar berry por nombre válido
    When solicito el berry con nombre "cheri"
    Then la respuesta debería tener status 200
    And el body debería contener el id de la berry esperado

  Scenario: Consultar berry por nombre inválido
    When solicito el berry con nombre "not-a-real-berry"
    Then la respuesta debería tener status 404
