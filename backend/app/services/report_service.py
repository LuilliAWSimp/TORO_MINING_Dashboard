from __future__ import annotations

import tempfile
from datetime import datetime, timedelta
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas

from backend.app.catalog import AREA_BY_ID
from backend.app.config import settings
from backend.app.models import DashboardSnapshot
from backend.app.providers.base import DataProvider


SILVER = colors.HexColor("#B2B2B1")
GRAPHITE = colors.HexColor("#353535")
LIGHT_GRAPHITE = colors.HexColor("#737371")
GOLD = colors.HexColor("#BE9D56")
GOLD_DARK = colors.HexColor("#96691E")
GOLD_LIGHT = colors.HexColor("#E2D5A7")
PAPER = colors.HexColor("#FFFFFF")
PANEL = colors.HexColor("#F4F4F2")
BORDER = colors.HexColor("#D7D7D4")
GOOD = colors.HexColor("#2E7D5A")
WARNING = colors.HexColor("#B7791F")
CRITICAL = colors.HexColor("#B23A3A")
OFFLINE = colors.HexColor("#59697A")


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states: list[dict] = []

    def showPage(self):  # noqa: N802
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_page_number(page_count)
            super().showPage()
        super().save()

    def _draw_page_number(self, page_count: int):
        self.saveState()
        self.setStrokeColor(BORDER)
        self.line(15 * mm, 12 * mm, A4[0] - 15 * mm, 12 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(LIGHT_GRAPHITE)
        self.drawString(15 * mm, 7.5 * mm, "TORO MINING · Mina San Bernardo · DATOS DEMO")
        self.drawRightString(A4[0] - 15 * mm, 7.5 * mm, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def _period_label(period: str, shift: str, start: datetime | None, end: datetime | None, snapshot: DashboardSnapshot) -> str:
    if period == "day":
        return f"Día operativo · {snapshot.generated_at:%d/%m/%Y}"
    if period == "custom" and start and end:
        return f"Personalizado · {start:%d/%m/%Y %H:%M} a {end:%d/%m/%Y %H:%M}"
    selected = snapshot.shift if shift == "current" else f"Turno {shift}"
    return f"{selected} · {snapshot.generated_at:%d/%m/%Y}"


def _chart(path: Path, x, y, title: str, unit: str, accent: str) -> None:
    fig, ax = plt.subplots(figsize=(7.2, 2.15), dpi=150)
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    ax.plot(x, y, color=accent, linewidth=2.0)
    ax.fill_between(x, y, color=accent, alpha=0.10)
    ax.set_title(title, loc="left", fontsize=10, fontweight="bold", color="#353535", pad=8)
    ax.set_ylabel(unit, fontsize=8, color="#737371")
    ax.tick_params(axis="both", labelsize=7, colors="#737371")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))
    ax.grid(axis="y", color="#D7D7D4", linewidth=0.6, alpha=0.8)
    for spine in ax.spines.values():
        spine.set_visible(False)
    fig.tight_layout(pad=1)
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def _status_color(status: str):
    return {
        "running": GOOD,
        "stopped": LIGHT_GRAPHITE,
        "warning": WARNING,
        "alarm": CRITICAL,
        "offline": OFFLINE,
    }.get(status, LIGHT_GRAPHITE)


def generate_operational_report(
    provider: DataProvider,
    period: str = "current_shift",
    shift: str = "current",
    start: datetime | None = None,
    end: datetime | None = None,
) -> Path:
    snapshot = provider.get_snapshot(window_hours=12 if period != "day" else 24)
    generated_at = snapshot.generated_at
    file_name = f"reporte_operativo_{generated_at:%Y%m%d_%H%M%S}.pdf"
    output = settings.reports_dir / file_name

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=GRAPHITE,
        alignment=TA_CENTER,
        spaceAfter=3 * mm,
    ))
    styles.add(ParagraphStyle(
        name="Section",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=GRAPHITE,
        spaceBefore=3 * mm,
        spaceAfter=2 * mm,
    ))
    styles.add(ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=10.5,
        textColor=GRAPHITE,
    ))
    styles.add(ParagraphStyle(
        name="Tiny",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.3,
        leading=9,
        textColor=GRAPHITE,
    ))
    styles.add(ParagraphStyle(
        name="TableHeader",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9,
        textColor=colors.white,
        alignment=TA_CENTER,
    ))

    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=13 * mm,
        bottomMargin=17 * mm,
        title="Reporte Operativo TORO MINING - Mina San Bernardo",
        author="TORO MINING",
        subject="Reporte operativo local con datos demo",
    )

    story = []
    logo_path = settings.assets_dir / "toro-mining-logo.png"
    if logo_path.exists():
        max_width, max_height = 78 * mm, 24 * mm
        with PILImage.open(logo_path) as source:
            aspect = source.width / source.height
        width, height = max_width, max_width / aspect
        if height > max_height:
            width, height = max_height * aspect, max_height
        logo = Image(str(logo_path), width=width, height=height)
        logo.hAlign = "CENTER"
        story.extend([logo, Spacer(1, 1.5 * mm)])
    story.append(Paragraph("Reporte Operativo", styles["ReportTitle"]))
    story.append(Paragraph("Mina San Bernardo", ParagraphStyle(
        "Mine", parent=styles["Heading2"], alignment=TA_CENTER, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", fontSize=12, leading=14, spaceAfter=3 * mm,
    )))

    demo_banner = Table(
        [[Paragraph("DATOS DEMO", ParagraphStyle("Demo", parent=styles["Small"], fontName="Helvetica-Bold", textColor=GRAPHITE, alignment=TA_CENTER)),
          Paragraph("Simulación conceptual; no representa inventario, producción ni mediciones confirmadas.", styles["Small"])]],
        colWidths=[31 * mm, 149 * mm],
    )
    demo_banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GOLD_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.7, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.extend([demo_banner, Spacer(1, 3 * mm)])

    metadata = [
        ["Generado", f"{generated_at:%d/%m/%Y %H:%M:%S}", "Periodo", _period_label(period, shift, start, end, snapshot)],
        ["Turno", snapshot.shift, "Última lectura", f"{snapshot.last_reading_at:%d/%m/%Y %H:%M:%S}"],
        ["Fuente", snapshot.source_label, "Catálogo", snapshot.catalog_status],
    ]
    metadata_table = Table(metadata, colWidths=[22 * mm, 58 * mm, 25 * mm, 75 * mm])
    metadata_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.8),
        ("TEXTCOLOR", (0, 0), (-1, -1), GRAPHITE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.extend([metadata_table, Spacer(1, 3 * mm)])

    story.append(Paragraph("Indicadores principales", styles["Section"]))
    k = snapshot.kpis
    kpi_rows = [
        ["Producción actual", f"{k.production_current_tph:.1f} t/h", "Acumulado del día", f"{k.production_today_t:.1f} t"],
        ["Avance objetivo 400 t/d", f"{k.objective_progress_pct:.1f} %", "Demanda eléctrica", f"{k.power_kw:.1f} kW"],
        ["Energía acumulada", f"{k.energy_today_kwh:.1f} kWh", "Consumo específico", f"{k.specific_energy_kwh_t:.2f} kWh/t"],
        ["Agua recirculada", f"{k.water_recirculation_pct:.1f} %", "Alarmas activas", str(k.active_alarms)],
    ]
    kpi_table = Table(kpi_rows, colWidths=[42 * mm, 42 * mm, 42 * mm, 54 * mm])
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("TEXTCOLOR", (0, 0), (-1, -1), GRAPHITE),
        ("TEXTCOLOR", (1, 0), (1, -1), GOLD_DARK),
        ("TEXTCOLOR", (3, 0), (3, -1), GOLD_DARK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("ALIGN", (3, 0), (3, -1), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([kpi_table, Spacer(1, 3 * mm)])

    with tempfile.TemporaryDirectory(prefix="toro_report_") as tmp:
        tmp_path = Path(tmp)
        timestamps = [item.timestamp for item in snapshot.trends]
        chart_specs = [
            ("production.png", [item.production_tph for item in snapshot.trends], "Producción", "t/h", "#96691E"),
            ("energy.png", [item.power_kw for item in snapshot.trends], "Demanda eléctrica", "kW", "#4B6777"),
            ("water.png", [item.water_recirculation_pct for item in snapshot.trends], "Agua recirculada", "%", "#2E7D5A"),
        ]
        for filename, values, title, unit, accent in chart_specs:
            _chart(tmp_path / filename, timestamps, values, title, unit, accent)

        story.append(Paragraph("Tendencias operativas", styles["Section"]))
        for filename, _, _, _, _ in chart_specs:
            story.append(Image(str(tmp_path / filename), width=180 * mm, height=51 * mm))
            story.append(Spacer(1, 1 * mm))

        story.append(Spacer(1, 2 * mm))
        story.append(Paragraph("Resumen de equipos conceptuales", styles["Section"]))
        story.append(Paragraph(
            "Los equipos listados son representativos del P&ID conceptual y no constituyen un inventario validado.",
            styles["Small"],
        ))
        story.append(Spacer(1, 2 * mm))
        equipment_rows = [[
            Paragraph("Área", styles["TableHeader"]),
            Paragraph("Equipo", styles["TableHeader"]),
            Paragraph("Tipo", styles["TableHeader"]),
            Paragraph("Estado", styles["TableHeader"]),
            Paragraph("Lecturas demo", styles["TableHeader"]),
            Paragraph("Última actualización", styles["TableHeader"]),
        ]]
        for item in snapshot.equipment:
            values = "<br/>".join(
                f"{m.name}: {'N/D' if m.value is None else f'{m.value:g} {m.unit}'}" for m in item.measurements
            ) or "Sin sensores conceptuales"
            equipment_rows.append([
                Paragraph(AREA_BY_ID[item.area_id].name, styles["Tiny"]),
                Paragraph(item.name, styles["Tiny"]),
                Paragraph(item.equipment_type, styles["Tiny"]),
                Paragraph(item.status_label, ParagraphStyle(
                    f"status-{item.id}", parent=styles["Tiny"], fontName="Helvetica-Bold",
                    textColor=_status_color(item.status.value), alignment=TA_CENTER,
                )),
                Paragraph(values, styles["Tiny"]),
                Paragraph(f"{item.last_update:%d/%m/%Y}<br/>{item.last_update:%H:%M:%S}", ParagraphStyle(
                    f"date-{item.id}", parent=styles["Tiny"], alignment=TA_CENTER,
                )),
            ])
        equipment_table = Table(
            equipment_rows,
            colWidths=[33 * mm, 28 * mm, 26 * mm, 22 * mm, 48 * mm, 23 * mm],
            repeatRows=1,
        )
        equipment_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), GRAPHITE),
            ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, PANEL]),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(equipment_table)

        story.append(PageBreak())
        story.append(Paragraph("Alarmas relevantes", styles["Section"]))
        if snapshot.alarms:
            alarm_rows = [[
                Paragraph("Severidad", styles["TableHeader"]),
                Paragraph("Equipo", styles["TableHeader"]),
                Paragraph("Alarma", styles["TableHeader"]),
                Paragraph("Detalle", styles["TableHeader"]),
                Paragraph("Activa desde", styles["TableHeader"]),
            ]]
            for alarm in snapshot.alarms:
                severity_label = {
                    "info": "Información", "warning": "Advertencia", "critical": "Crítica", "offline": "Sin comunicación"
                }[alarm.severity]
                severity_color = {"info": LIGHT_GRAPHITE, "warning": WARNING, "critical": CRITICAL, "offline": OFFLINE}[alarm.severity]
                alarm_rows.append([
                    Paragraph(severity_label, ParagraphStyle(
                        f"alarm-{alarm.id}", parent=styles["Tiny"], fontName="Helvetica-Bold",
                        textColor=severity_color, alignment=TA_CENTER,
                    )),
                    Paragraph(alarm.equipment_name, styles["Tiny"]),
                    Paragraph(alarm.title, styles["Tiny"]),
                    Paragraph(alarm.message, styles["Tiny"]),
                    Paragraph(f"{alarm.active_since:%d/%m/%Y}<br/>{alarm.active_since:%H:%M}", ParagraphStyle(
                        f"alarm-date-{alarm.id}", parent=styles["Tiny"], alignment=TA_CENTER,
                    )),
                ])
            alarm_table = Table(alarm_rows, colWidths=[27 * mm, 32 * mm, 35 * mm, 62 * mm, 24 * mm], repeatRows=1)
            alarm_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), GRAPHITE),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, PANEL]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(alarm_table)
        else:
            story.append(Paragraph("No hay alarmas activas en la simulación seleccionada.", styles["Small"]))

        story.extend([
            Spacer(1, 6 * mm),
            Paragraph("Notas del MVP", styles["Section"]),
            Paragraph(
                "Este reporte se genera localmente desde la misma fuente de datos demo utilizada por el dashboard. "
                "No incluye recuperación metalúrgica, ley de mineral, conexión SCADA/PLC ni escritura hacia sistemas de control.",
                styles["Small"],
            ),
        ])

        doc.build(story, canvasmaker=NumberedCanvas)

    return output
