//
//  CUTETicketForm.m
//  currant
//
//  Created by Foster Yin on 7/16/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicketForm.h"
#import "CUTETicketEditingListener.h"
#import "CUTECommonMacro.h"
#import "BFTask.h"
#import <BFTaskCompletionSource.h>
#import "CUTENotificationKey.h"
#import "NSDictionary+ObjectiveSugar.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketEditor.h"
#import "SVProgressHUD+CUTEAPI.h"


@implementation CUTETicketForm

- (BFTask *)syncTicketWithBlock:(UpdateTicketBlock)block {
    NSAssert(!IsNilOrNull(block), @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
    
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener new];
    [ticketListener startListenMarkWithSayer:self.ticket];
    block(self.ticket);
    [ticketListener stopListenMark];

    NSDictionary *ticketParams = [ticketListener getEditedParams];
    NSDictionary *propertyParams = [ticketListener.propertyListener getEditedParams];
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if (self.ticket && self.ticket.identifier) {

        //1. edit draft, should be in local database
        BOOL isDraftThatNotDeleted = [self.ticket.status isEqualToString:kTicketStatusDraft] && [[CUTEDataManager sharedInstance] getRentTicketById:self.ticket.identifier];
        //2. edit "to rent", may not existed in local database
        BOOL isToRent = [self.ticket.status isEqualToString:kTicketStatusToRent];
        //3. edit "rent", may not existed in local database
        BOOL isRent = [self.ticket.status isEqualToString:kTicketStatusRent];

        if (isDraftThatNotDeleted || isToRent || isRent) {
            [[CUTEDataManager sharedInstance] saveRentTicket:self.ticket];
            [[[CUTERentTicketEditor sharedInstance] editTicketWithTicket:self.ticket ticketParams:ticketParams propertyParams:propertyParams] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [tcs setError:task.error];
                }
                else if (task.exception) {
                    [tcs setException:task.exception];
                }
                else if (task.isCancelled) {
                    [tcs cancel];
                }
                else {
                    [[CUTEDataManager sharedInstance] saveRentTicket:task.result];
                    [tcs setResult:self.ticket];
                }
                return task;
            }];
        }
        else {
            [tcs setResult:self.ticket];
        }
    }
    else {
        [tcs setResult:self.ticket];
    }

    return tcs.task;
}

@end
