import { supabase } from './supabase';
import { AnalysisResult } from './types';

export interface ChatSession {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessageData {
    id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: AnalysisResult | string;
    created_at: string;
}

export async function createSession(userId: string, title: string) {
    const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, title })
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        throw error;
    }
    return data as ChatSession;
}

export async function getSessions(userId: string) {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
    return data as ChatSession[];
}

export async function saveMessage(sessionId: string, role: string, content: any) {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            session_id: sessionId,
            role,
            content
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving message:', error);
        // Don't throw, just log. We don't want to break the UI if history save fails.
        return null;
    }

    // Update session updated_at
    await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

    return data;
}

export async function getMessages(sessionId: string) {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data as ChatMessageData[];
}

export async function deleteSession(sessionId: string) {
    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
}
