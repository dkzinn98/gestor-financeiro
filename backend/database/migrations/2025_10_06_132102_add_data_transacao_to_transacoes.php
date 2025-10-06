<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transacoes', function (Blueprint $table) {
            if (!Schema::hasColumn('transacoes', 'data_transacao')) {
                $table->date('data_transacao')->nullable()->after('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transacoes', function (Blueprint $table) {
            if (Schema::hasColumn('transacoes', 'data_transacao')) {
                $table->dropColumn('data_transacao');
            }
        });
    }
};
