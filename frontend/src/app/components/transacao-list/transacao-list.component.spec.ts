import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, throwError } from 'rxjs';
import { TransacaoListComponent } from './transacao-list.component';
import { TransactionService } from '../../services/transaction.service';
import { NotificationService } from '../../services/notification.service';

describe('TransacaoListComponent', () => {
  let component: TransacaoListComponent;
  let fixture: ComponentFixture<TransacaoListComponent>;
  let transactionService: TransactionService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule,
        TransacaoListComponent
      ],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            getSummary: () => of({ totalIncome: 0, totalExpense: 0, balanco: 0 }),
            getRecentTransactions: () => of([]),
            getAllTransactions: () => of([]),
            deleteTransaction: () => of(undefined),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: () => {},
            error: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransacaoListComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService);
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    const getSummarySpy = spyOn(transactionService, 'getSummary').and.returnValue(
      of({ totalIncome: 100, totalExpense: 50, balanco: 50 })
    );
    const getRecentTransactionsSpy = spyOn(
      transactionService,
      'getRecentTransactions'
    ).and.returnValue(of([]));

    component.ngOnInit();

    expect(getSummarySpy).toHaveBeenCalled();
    expect(getRecentTransactionsSpy).toHaveBeenCalled();
    expect(component.summary).toEqual({
      totalIncome: 100,
      totalExpense: 50,
      balanco: 50,
    });
    expect(component.isLoading).toBeFalse();
  });

  it('should handle errors when loading dashboard data', () => {
    const getSummarySpy = spyOn(transactionService, 'getSummary').and.returnValue(
      throwError('Erro ao carregar resumo')
    );
    const getRecentTransactionsSpy = spyOn(
      transactionService,
      'getRecentTransactions'
    ).and.returnValue(throwError('Erro ao carregar transações recentes'));
    const notificationErrorSpy = spyOn(notificationService, 'error');

    component.ngOnInit();

    expect(getSummarySpy).toHaveBeenCalled();
    expect(getRecentTransactionsSpy).toHaveBeenCalled();
    expect(notificationErrorSpy).toHaveBeenCalledTimes(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should load transactions on init', () => {
    const getAllTransactionsSpy = spyOn(
      transactionService,
      'getAllTransactions'
    ).and.returnValue(of([{ id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita'}]));

    component.ngOnInit();

    expect(getAllTransactionsSpy).toHaveBeenCalled();
    expect(component.transacoes).toEqual([{ id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita'}]);
    expect(component.transacoesFiltradas).toEqual([{ id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' }]);
  });

  it('should handle errors when loading transactions', () => {
    const getAllTransactionsSpy = spyOn(
      transactionService,
      'getAllTransactions'
    ).and.returnValue(throwError('Erro ao carregar transações'));
    const notificationErrorSpy = spyOn(notificationService, 'error');

    component.ngOnInit();

    expect(getAllTransactionsSpy).toHaveBeenCalled();
    expect(notificationErrorSpy).toHaveBeenCalled();
  });

  it('should filter transactions by type', () => {
    component.transacoes = [
      { id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' },
      { id: 2, descricao: 'Transação 2', valor: 50, tipo: 'despesa' },
      { id: 3, descricao: 'Transação 3', valor: 75, tipo: 'receita' },
    ];
    component.transacoesFiltradas = [...component.transacoes];

    component.filtroTipo = 'receita';
    component.filtrarTransacoes();

    expect(component.transacoesFiltradas).toEqual([
      { id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' },
      { id: 3, descricao: 'Transação 3', valor: 75, tipo: 'receita' },
    ]);

    component.filtroTipo = 'despesa';
    component.filtrarTransacoes();

    expect(component.transacoesFiltradas).toEqual([
      { id: 2, descricao: 'Transação 2', valor: 50, tipo: 'despesa' },
    ]);

    component.filtroTipo = '';
    component.filtrarTransacoes();

    expect(component.transacoesFiltradas).toEqual(component.transacoes);
  });

  it('should navigate to edit transaction page', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const transacao = { id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' };

    component.editarTransacao(transacao);

    expect(routerSpy).toHaveBeenCalledWith(['/nova-transacao', 1]);
  });

  it('should delete a transaction', () => {
    const deleteTransactionSpy = spyOn(
      transactionService,
      'deleteTransaction'
    ).and.returnValue(of(undefined));
    const carregarTransacoesSpy = spyOn(component, 'carregarTransacoes');
    const notificationSuccessSpy = spyOn(notificationService, 'success');
    spyOn(window, 'confirm').and.returnValue(true);

    component.deletarTransacao(1);

    expect(deleteTransactionSpy).toHaveBeenCalledWith(1);
    expect(notificationSuccessSpy).toHaveBeenCalledWith(
      'Transação excluída com sucesso!'
    );
    expect(carregarTransacoesSpy).toHaveBeenCalled();
  });

  it('should handle errors when deleting a transaction', () => {
    const deleteTransactionSpy = spyOn(
      transactionService,
      'deleteTransaction'
    ).and.returnValue(throwError('Erro ao excluir'));
    const notificationErrorSpy = spyOn(notificationService, 'error');
    spyOn(window, 'confirm').and.returnValue(true);

    component.deletarTransacao(1);

    expect(deleteTransactionSpy).toHaveBeenCalledWith(1);
    expect(notificationErrorSpy).toHaveBeenCalledWith(
      'Erro ao excluir a transação.'
    );
  });
});

