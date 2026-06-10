import type {
  Category,
  ChecklistItem,
  Couple,
  Expense,
  Installment,
  ItineraryItem,
  PlannedExpense,
  Profile,
  SavingsGoal,
  Settlement,
  Subcategory,
  Trip
} from "./models";

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      couples: TableDef<Couple>;
      trips: TableDef<Trip>;
      categories: TableDef<Category>;
      subcategories: TableDef<Subcategory>;
      planned_expenses: TableDef<PlannedExpense>;
      expenses: TableDef<Expense>;
      settlements: TableDef<Settlement>;
      checklist_items: TableDef<ChecklistItem>;
      itinerary_items: TableDef<ItineraryItem>;
      savings_goals: TableDef<SavingsGoal>;
      installments: TableDef<Installment>;
      app_settings: TableDef<{ id: string; couple_id: string; key: string; value: Record<string, unknown> }>;
      couple_members: TableDef<{ id: string; couple_id: string; user_id: string; role: string; person_key: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      create_workspace: {
        Args: {
          p_full_name: string;
          p_display_name: string;
          p_person_key: string;
          p_couple_name: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
};
