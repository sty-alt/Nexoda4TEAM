"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import { useLocale } from "@/i18n/locale-provider";
import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CalendarPage() {
  const { locale } = useLocale();
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("MEETING");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventTime, setEventTime] = useState("10:00");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { events: [] };
      const res = await fetch(`/api/calendar?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const events = data?.events || [];

  const createEventMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Event created");
      setNewEventOpen(false);
      setEventTitle("");
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const [hours, minutes] = eventTime.split(":");
    const start = new Date(eventDate);
    start.setHours(parseInt(hours) || 10, parseInt(minutes) || 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    createEventMutation.mutate({
      workspaceId,
      title: eventTitle.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: eventType,
    });
  };

  // Month grid calculations
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

    // Padding for previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, 0 - (startingDayOfWeek - 1 - i));
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Trailing days
    let dayCount = 1;
    while (days.length % 7 !== 0) {
      const nextDate: Date = new Date(year, month + 1, dayCount);
      days.push({ date: nextDate, isCurrentMonth: false });
      dayCount++;
    }

    return days;
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MEETING":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "TASK_BLOCK":
        return "bg-primary/15 text-primary border-primary/30";
      case "DEADLINE":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>Calendar & Deadlines</LocalizedText></h1>
            <span className="font-mono text-sm font-semibold text-muted-foreground">
              {currentDate.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
            Team meetings, task blocks, project deadlines, and personal milestones
          </LocalizedText></p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center border border-border/40 rounded-lg p-0.5 bg-card">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={today} className="h-7 px-2.5 text-xs"><LocalizedText>
              Today
            </LocalizedText></Button>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setNewEventOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="h-4 w-4" /><LocalizedText> New Event
          </LocalizedText></Button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/50 shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
          <div><LocalizedText>Sun</LocalizedText></div>
          <div><LocalizedText>Mon</LocalizedText></div>
          <div><LocalizedText>Tue</LocalizedText></div>
          <div><LocalizedText>Wed</LocalizedText></div>
          <div><LocalizedText>Thu</LocalizedText></div>
          <div><LocalizedText>Fri</LocalizedText></div>
          <div><LocalizedText>Sat</LocalizedText></div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/30">
          {monthDays.map((dayObj, idx) => {
            const dateStr = dayObj.date.toISOString().split("T")[0];
            const isToday =
              dayObj.date.toDateString() === new Date().toDateString();

            const dayEvents = events.filter((e: any) => {
              const eventDateStr = new Date(e.startTime).toISOString().split("T")[0];
              return eventDateStr === dateStr;
            });

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 space-y-1 transition-colors ${
                  !dayObj.isCurrentMonth
                    ? "bg-muted/10 opacity-40"
                    : "hover:bg-accent/20"
                } ${isToday ? "bg-primary/5 font-semibold" : ""}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center font-medium ${
                      isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {dayObj.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.map((evt: any) => (
                    <div
                      key={evt.id}
                      className={`px-1.5 py-1 rounded text-[11px] border truncate flex items-center justify-between group ${getTypeColor(
                        evt.type
                      )}`}
                    >
                      <span className="truncate">{evt.title}</span>
                      <button
                        onClick={() => deleteEventMutation.mutate(evt.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity ml-1"
                        title="Delete event"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Event Dialog */}
      <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /><LocalizedText> Create Calendar Event
              </LocalizedText></DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Event Title</LocalizedText></label>
                <Input
                  placeholder="e.g. Sprint 24 Retrospective"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground"><LocalizedText>Date</LocalizedText></label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground"><LocalizedText>Time</LocalizedText></label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Event Category</LocalizedText></label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="MEETING"><LocalizedText>Meeting</LocalizedText></option>
                  <option value="TASK_BLOCK"><LocalizedText>Task Block</LocalizedText></option>
                  <option value="DEADLINE"><LocalizedText>Deadline</LocalizedText></option>
                  <option value="PERSONAL"><LocalizedText>Personal</LocalizedText></option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setNewEventOpen(false)}><LocalizedText>
                Cancel
              </LocalizedText></Button>
              <Button type="submit" size="sm" disabled={createEventMutation.isPending}><LocalizedText>
                Create Event
              </LocalizedText></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

