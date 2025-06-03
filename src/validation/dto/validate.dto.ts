export interface ValidateDto {
  category: string;
  items: { rank: number; name: string }[];
  lang: string;
}
