import { Alert } from 'react-native';
import { MOCK_MODE } from '../api/client';

type PendingIntegration = 'click' | 'payme' | 'myid' | 'eskiz';

const LABELS: Record<PendingIntegration, string> = {
    click: 'Click',
    payme: 'Payme',
    myid: 'MyID',
    eskiz: 'Eskiz SMS',
};

const MESSAGES: Record<PendingIntegration, string> = {
    click: 'Оплату через Click включим после договора с провайдером.',
    payme: 'Оплату через Payme включим после договора с провайдером.',
    myid: 'Верификацию MyID включим после договора с провайдером.',
    eskiz: 'SMS-коды через Eskiz включим после договора с провайдером.',
};

export function guardPendingIntegration(integration: PendingIntegration) {
    if (MOCK_MODE) return false;

    Alert.alert(
        `${LABELS[integration]} пока не подключен`,
        MESSAGES[integration]
    );
    return true;
}
