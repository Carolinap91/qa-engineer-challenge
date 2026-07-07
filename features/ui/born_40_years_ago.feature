@ui
Feature: Born Today - Celebridades nacidas hace exactamente 40 años
  Como usuario de IMDb quiero buscar celebridades nacidas en la misma
  fecha que hoy pero hace 40 años, usando el date picker y un campo de texto,
  y capturar evidencia del primer link en la descripción del 1er resultado.

  Scenario: Buscar por rango de fecha exacto y capturar evidencia
    Given que estoy en la página principal de IMDb
    When despliego el menú y navego a la sección "Born Today"
    And elimino la búsqueda por defecto
    And despliego el filtro "Birth date"
    And selecciono la fecha de hace 40 años en el date picker del campo "from"
    And escribo la fecha de hoy en el campo de texto "to"
    And ejecuto la búsqueda
    And en el 1er resultado hago click en el 1er link de su descripción, si existe
    Then debería tomar un screenshot de la página resultante
