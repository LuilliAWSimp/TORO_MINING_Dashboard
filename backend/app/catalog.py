from __future__ import annotations

from backend.app.models import AreaDefinition, EquipmentDefinition, SensorDefinition


def sensor(
    sensor_id: str,
    name: str,
    metric: str,
    unit: str,
    decimals: int = 1,
    min_value: float | None = None,
    max_value: float | None = None,
) -> SensorDefinition:
    return SensorDefinition(
        id=sensor_id,
        name=name,
        metric=metric,
        unit=unit,
        decimals=decimals,
        min_value=min_value,
        max_value=max_value,
    )


EQUIPMENT: list[EquipmentDefinition] = [
    EquipmentDefinition(
        id="HT-101",
        name="Tolva HT-101",
        area_id="reception",
        equipment_type="Tolva",
        description="Recepción conceptual de mineral ROM.",
        sensors=[sensor("HT101_LEVEL", "Nivel de tolva", "level", "%", 1, 0, 100)],
    ),
    EquipmentDefinition(
        id="VF-102",
        name="Alimentador VF-102",
        area_id="reception",
        equipment_type="Alimentador vibratorio",
        description="Dosificación conceptual hacia trituración.",
        sensors=[sensor("VF102_FLOW", "Alimentación", "flow", "t/h", 1, 0, 30)],
    ),
    EquipmentDefinition(
        id="CV-103",
        name="Banda CV-103",
        area_id="reception",
        equipment_type="Transportador",
        description="Transferencia conceptual de mineral.",
        sensors=[sensor("CV103_FLOW", "Carga transportada", "flow", "t/h", 1, 0, 30)],
    ),
    EquipmentDefinition(
        id="CR-104",
        name="Trituradora CR-104",
        area_id="reception",
        equipment_type="Trituradora",
        description="Reducción primaria conceptual.",
        sensors=[
            sensor("CR104_TEMP", "Temperatura de rodamiento", "temperature", "°C", 1, 20, 95),
            sensor("CR104_FLOW", "Mineral triturado", "flow", "t/h", 1, 0, 30),
        ],
    ),
    EquipmentDefinition(
        id="ML-201",
        name="Molino ML-201",
        area_id="milling",
        equipment_type="Molino",
        description="Molienda húmeda conceptual del mineral.",
        sensors=[
            sensor("ML201_TEMP", "Temperatura de chumacera", "temperature", "°C", 1, 20, 90),
            sensor("ML201_DENSITY", "Densidad de pulpa", "density", "kg/m³", 0, 900, 1900),
        ],
    ),
    EquipmentDefinition(
        id="CY-202",
        name="Ciclones CY-202",
        area_id="milling",
        equipment_type="Batería de ciclones",
        description="Clasificación conceptual de pulpa.",
        sensors=[
            sensor("CY202_PRESSURE", "Presión de alimentación", "pressure", "kPa", 1, 0, 180),
            sensor("CY202_DENSITY", "Densidad de alimentación", "density", "kg/m³", 0, 900, 1900),
        ],
    ),
    EquipmentDefinition(
        id="SP-203",
        name="Cajón SP-203",
        area_id="milling",
        equipment_type="Cajón de bombeo",
        description="Pulmón conceptual del circuito de clasificación.",
        sensors=[sensor("SP203_LEVEL", "Nivel de cajón", "level", "%", 1, 0, 100)],
    ),
    EquipmentDefinition(
        id="P-201A",
        name="Bomba P-201A",
        area_id="milling",
        equipment_type="Bomba de pulpa",
        description="Bombeo conceptual hacia ciclones.",
        sensors=[
            sensor("P201A_PRESSURE", "Presión de descarga", "pressure", "kPa", 1, 0, 220),
            sensor("P201A_FLOW", "Flujo de pulpa", "flow", "m³/h", 1, 0, 160),
        ],
    ),
    EquipmentDefinition(
        id="P-201B",
        name="Bomba P-201B",
        area_id="milling",
        equipment_type="Bomba de pulpa",
        description="Bomba conceptual de respaldo del circuito.",
        sensors=[
            sensor("P201B_PRESSURE", "Presión de descarga", "pressure", "kPa", 1, 0, 220),
            sensor("P201B_FLOW", "Flujo de pulpa", "flow", "m³/h", 1, 0, 160),
        ],
    ),
    EquipmentDefinition(
        id="TK-301",
        name="Celdas TK-301",
        area_id="beneficiation",
        equipment_type="Celdas metalúrgicas",
        description="Etapa metalúrgica conceptual Au-Ag. Sin cálculo de recuperación ni ley.",
        sensors=[
            sensor("TK301_PH", "pH de proceso", "ph", "pH", 2, 0, 14),
            sensor("TK301_ORP", "Potencial ORP/Eh", "orp", "mV", 0, -500, 800),
            sensor("TK301_LEVEL", "Nivel de celda", "level", "%", 1, 0, 100),
        ],
    ),
    EquipmentDefinition(
        id="TH-401",
        name="Espesador TH-401",
        area_id="thickening",
        equipment_type="Espesador",
        description="Espesamiento conceptual previo a filtración.",
        sensors=[
            sensor("TH401_LEVEL", "Nivel de cama", "level", "%", 1, 0, 100),
            sensor("TH401_DENSITY", "Densidad de descarga", "density", "kg/m³", 0, 900, 1900),
        ],
    ),
    EquipmentDefinition(
        id="FP-402",
        name="Filtro prensa FP-402",
        area_id="thickening",
        equipment_type="Filtro prensa",
        description="Filtración conceptual por ciclos.",
        sensors=[sensor("FP402_PRESSURE", "Presión hidráulica", "pressure", "bar", 1, 0, 18)],
    ),
    EquipmentDefinition(
        id="WT-601",
        name="Tanque WT-601",
        area_id="water_tailings",
        equipment_type="Tanque de agua",
        description="Almacenamiento conceptual de agua recirculada.",
        sensors=[
            sensor("WT601_LEVEL", "Nivel de tanque", "level", "%", 1, 0, 100),
            sensor("WT601_COND", "Conductividad", "conductivity", "µS/cm", 0, 0, 5000),
        ],
    ),
    EquipmentDefinition(
        id="CL-602",
        name="Clarificador CL-602",
        area_id="water_tailings",
        equipment_type="Clarificador",
        description="Clarificación conceptual de agua de proceso.",
        sensors=[sensor("CL602_LEVEL", "Nivel de clarificador", "level", "%", 1, 0, 100)],
    ),
    EquipmentDefinition(
        id="P-602A",
        name="Bomba P-602A",
        area_id="water_tailings",
        equipment_type="Bomba de agua",
        description="Retorno conceptual de agua recuperada.",
        sensors=[
            sensor("P602A_PRESSURE", "Presión de descarga", "pressure", "bar", 1, 0, 12),
            sensor("P602A_FLOW", "Flujo de retorno", "flow", "m³/h", 1, 0, 160),
        ],
    ),
    EquipmentDefinition(
        id="P-602B",
        name="Bomba P-602B",
        area_id="water_tailings",
        equipment_type="Bomba de agua",
        description="Bomba conceptual de respaldo de agua recuperada.",
        sensors=[
            sensor("P602B_PRESSURE", "Presión de descarga", "pressure", "bar", 1, 0, 12),
            sensor("P602B_FLOW", "Flujo de retorno", "flow", "m³/h", 1, 0, 160),
        ],
    ),
]


AREAS: list[AreaDefinition] = [
    AreaDefinition(
        id="reception",
        name="Recepción y manejo de mineral",
        order=1,
        description="Recepción, dosificación, transporte y trituración conceptual.",
        equipment_ids=["HT-101", "VF-102", "CV-103", "CR-104"],
    ),
    AreaDefinition(
        id="milling",
        name="Molienda y clasificación",
        order=2,
        description="Molienda húmeda, bombeo y clasificación conceptual.",
        equipment_ids=["ML-201", "CY-202", "SP-203", "P-201A", "P-201B"],
    ),
    AreaDefinition(
        id="beneficiation",
        name="Beneficio metalúrgico Au-Ag",
        order=3,
        description="Etapa metalúrgica conceptual sin indicadores de recuperación o ley.",
        equipment_ids=["TK-301"],
    ),
    AreaDefinition(
        id="thickening",
        name="Espesamiento y filtración",
        order=4,
        description="Concentración de sólidos y filtración conceptual.",
        equipment_ids=["TH-401", "FP-402"],
    ),
    AreaDefinition(
        id="final_product",
        name="Producto final",
        order=5,
        description="Salida conceptual del proceso. Sin inventario de producto confirmado.",
        equipment_ids=[],
    ),
    AreaDefinition(
        id="water_tailings",
        name="Manejo de agua y jales",
        order=6,
        description="Recuperación y retorno conceptual de agua de proceso.",
        equipment_ids=["WT-601", "CL-602", "P-602A", "P-602B"],
    ),
    AreaDefinition(
        id="digital_services",
        name="Servicios e integración digital",
        order=7,
        description="Capa conceptual de energía, supervisión y futura integración de datos.",
        equipment_ids=[],
    ),
]


EQUIPMENT_BY_ID = {item.id: item for item in EQUIPMENT}
AREA_BY_ID = {item.id: item for item in AREAS}
