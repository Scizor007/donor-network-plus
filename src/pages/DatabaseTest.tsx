import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const DatabaseTest: React.FC = () => {
    const { user } = useAuth();
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const addResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const runDatabaseTests = async () => {
        setIsTesting(true);
        setTestResults([]);

        try {
            // Test 1: Check Supabase connection
            addResult('Testing Supabase connection...');
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                addResult(`❌ Session error: ${sessionError.message}`);
            } else {
                addResult(`✅ Session: ${session ? 'Active' : 'No session'}`);
            }

            // Test 2: Check if user is authenticated
            if (user) {
                addResult(`✅ User authenticated: ${user.email}`);
            } else {
                addResult('❌ No authenticated user');
            }

            // Test 3: Check profiles table
            addResult('Testing profiles table...');
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .limit(1);

            if (profilesError) {
                addResult(`❌ Profiles table error: ${profilesError.message}`);
            } else {
                addResult(`✅ Profiles table accessible (${profiles?.length || 0} records found)`);
            }

            // Test 4: Check if current user has a profile
            if (user) {
                addResult('Testing user profile...');
                const { data: userProfile, error: userProfileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (userProfileError) {
                    if (userProfileError.code === 'PGRST116') {
                        addResult('⚠️ User profile does not exist (this is normal for new users)');
                    } else {
                        addResult(`❌ User profile error: ${userProfileError.message}`);
                    }
                } else {
                    addResult(`✅ User profile found: ${userProfile.full_name}`);
                }
            }

            // Test 5: Check other tables
            const tables = ['blood_banks', 'emergency_locations', 'blood_donation_camps'];
            for (const table of tables) {
                addResult(`Testing ${table} table...`);
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    addResult(`❌ ${table} error: ${error.message}`);
                } else {
                    addResult(`✅ ${table} accessible (${data?.length || 0} records found)`);
                }
            }

            addResult('🎉 Database tests completed!');

        } catch (error) {
            addResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Database Connection Test</CardTitle>
                        <p className="text-muted-foreground">
                            This page tests the database connection and table accessibility.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={runDatabaseTests}
                            disabled={isTesting}
                            className="w-full"
                        >
                            {isTesting ? 'Running Tests...' : 'Run Database Tests'}
                        </Button>

                        {testResults.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Test Results:</h3>
                                <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                                    {testResults.map((result, index) => (
                                        <div key={index} className="text-sm font-mono mb-1">
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DatabaseTest;
