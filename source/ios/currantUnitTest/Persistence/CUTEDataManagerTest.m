//
//  CUTEDataManagerTest.m
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEDataManager.h"

@interface CUTEDataManager (Private)

- (void)setStore:(YTKKeyValueStore *)store;

@end

SpecBegin(DataManager)


describe(@"clearUser", ^{

    [[CUTEDataManager sharedInstance] clearUser];
    assertThat([CUTEDataManager sharedInstance].user, equalTo(nil));
});

describe(@"saveUser", ^ {

    it(@"should be save success", ^ {
        [[CUTEDataManager sharedInstance] clearUser];
        CUTEUser *user = [CUTEUser new];
        user.identifier = RANDOM_UUID;
        [[CUTEDataManager sharedInstance] saveUser:user];
        assertThat([CUTEDataManager sharedInstance].user, notNilValue());

    });
});

describe(@"clearAllRentTickets", ^{

    [[CUTEDataManager sharedInstance] clearAllRentTickets];
    assertThatInt([[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets].count, equalToInt(0));
});

describe(@"saveRentTicket", ^{

    beforeAll(^{

        [[CUTEDataManager sharedInstance] clearAllRentTickets];
    });

    it(@"should be save success", ^{
        CUTETicket *ticket = [CUTETicket new];
        ticket.identifier = RANDOM_UUID;
        ticket.status = kTicketStatusDraft;
        [[CUTEDataManager sharedInstance] saveRentTicket:ticket];
        assertThatInt([[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets].count, equalToInt(1));
    });
});

describe(@"getRentTicketById", ^{

    it(@"should be get ticket success", ^{
        CUTETicket *ticket = [CUTETicket new];
        ticket.identifier = RANDOM_UUID;
        ticket.status = kTicketStatusDraft;
        [[CUTEDataManager sharedInstance] saveRentTicket:ticket];
        assertThat([[CUTEDataManager sharedInstance] getRentTicketById:ticket.identifier], notNilValue());
    });
});

describe(@"markRentTicketDeleted", ^{

    it(@"should mark success", ^{
        CUTETicket *ticket = [CUTETicket new];
        ticket.identifier = RANDOM_UUID;
        ticket.status = kTicketStatusDraft;
        [[CUTEDataManager sharedInstance] saveRentTicket:ticket];
        assertThat([[CUTEDataManager sharedInstance] getRentTicketById:ticket.identifier], notNilValue());
        [[CUTEDataManager sharedInstance] markRentTicketDeleted:ticket];
        assertThat([[CUTEDataManager sharedInstance] getRentTicketById:ticket.identifier].status, equalTo(kTicketStatusDeleted));
    });
});

describe(@"isRentTicketDeleted", ^{

    it(@"should mark success", ^{
        CUTETicket *ticket = [CUTETicket new];
        ticket.identifier = RANDOM_UUID;
        ticket.status = kTicketStatusDraft;
        [[CUTEDataManager sharedInstance] saveRentTicket:ticket];
        assertThat([[CUTEDataManager sharedInstance] getRentTicketById:ticket.identifier], notNilValue());
        [[CUTEDataManager sharedInstance] markRentTicketDeleted:ticket];
        assertThatBool([[CUTEDataManager sharedInstance] isRentTicketDeleted:ticket.identifier], isTrue());
    });
});

SpecEnd
