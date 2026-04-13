import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TASKS_PATH = path.join(process.cwd(), 'telegram-is-asistani', 'data', 'tasks.json');

function readTasks(): Record<string, any> {
  if (!fs.existsSync(TASKS_PATH)) return {};
  return JSON.parse(fs.readFileSync(TASKS_PATH, 'utf-8'));
}

function writeTasks(data: Record<string, any>) {
  fs.writeFileSync(TASKS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return NextResponse.json(readTasks());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = readTasks();

    // body: { planId, taskId, field, value }
    const { planId, taskId, field, value } = body;

    if (!tasks[planId]) tasks[planId] = {};
    if (!tasks[planId][taskId]) tasks[planId][taskId] = {};

    if (field === 'comment') {
      // Append comment
      if (!tasks[planId][taskId].comments) tasks[planId][taskId].comments = [];
      tasks[planId][taskId].comments.push({
        text: value,
        date: new Date().toISOString(),
      });
    } else {
      tasks[planId][taskId][field] = value;
    }

    writeTasks(tasks);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kaydetme hatasi' }, { status: 500 });
  }
}
