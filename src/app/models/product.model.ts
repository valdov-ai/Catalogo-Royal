export interface MensualidadOpcion {
  plazo: string;
  detalle: string;
}

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio_base: number | null;
  anticipo: number | null;
  saldo_a_financiar: number | null;
  mensualidades: { [plazo: string]: string | number } | null;
  galeria_imagenes: string[] | null;
}
