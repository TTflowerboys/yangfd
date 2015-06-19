//
//  CUTETicketTest.m
//  currant
//
//  Created by Foster Yin on 6/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Specta/Specta.h>
#define HC_SHORTHAND
#import <OCHamcrest/OCHamcrest.h>
#import <OCHamcrest/HCAssertThat.h>
#import <OCHamcrest/HCIsEqual.h>
#import "CUTETicket.h"


SpecBegin(Ticket)

describe(@"display title", ^ {
    it(@"should be custom value", ^ {
        CUTETicket *ticket = [CUTETicket new];
        ticket.title = @"good";
        assertThat(ticket.titleForDisplay, equalTo(@"good"));
    });

    it(@"should be community or street", ^ {
        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学"));
        ticket.property.community = nil;
        ticket.property.street = @"珞瑜路";
        assertThat(ticket.titleForDisplay, equalTo(@"珞瑜路"));
    });

    it(@"should have bedroom count", ^ {

        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        ticket.property.bedroomCount = 1;
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学 1居室"));
    });

    it(@"should have rent type", ^ {

        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        ticket.property.bedroomCount = 1;
        CUTEEnum *rentType = [CUTEEnum new];
        rentType.value = @"整租";
        ticket.rentType = rentType;
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学 1居室 整租出租"));
    });


});

SpecEnd