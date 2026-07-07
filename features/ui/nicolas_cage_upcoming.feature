@ui @cross-browser
Feature: Nicolas Cage - Upcoming credits
  Como usuario de IMDb quiero buscar a un actor y revisar sus créditos
  próximos para acceder a la primera película marcada como "Completed".

  Scenario: Acceder a la primera película "Completed" en Upcoming
    Given que estoy en la página principal de IMDb
    When busco al actor "Nicolas Cage" y accedo a su perfil
    And despliego la pestaña "Upcoming" en la sección de Credits
    And hago click en la primera película con la etiqueta "Completed"
    Then debería acceder a la página de detalle de esa película
