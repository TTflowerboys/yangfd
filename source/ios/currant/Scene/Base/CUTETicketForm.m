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
#import "CUTENotificationKey.h"
#import "NSDictionary+ObjectiveSugar.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"
#import "SVProgressHUD+CUTEAPI.h"

@implementation CUTETicketForm


//TODO Fix the cannot listen error
- (BFTask *)syncTicketWithUpdateInfo:(NSDictionary *)updateInfo {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    
    [updateInfo each:^(id key, id value) {
        if ([key hasPrefix:@"property."]) {
            [self.ticket.property setValue:value forKey:[key substringFromIndex:@"property.".length]];
        }
        else {
            [self.ticket setValue:value forKeyPath:key];
        }
    }];

    [ticketListener stopListenMark];

    NSDictionary *ticketParams = [ticketListener getEditedParams];
    NSDictionary *propertyParams = [ticketListener.propertyListener getEditedParams];
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if (self.ticket && self.ticket.identifier && ![[CUTEDataManager sharedInstance] isRentTicketDeleted:self.ticket.identifier]) {
        [[CUTEDataManager sharedInstance] saveRentTicket:self.ticket];
        [[[CUTERentTicketPublisher sharedInstance] editTicketWithTicket:self.ticket ticketParams:ticketParams propertyParams:propertyParams] continueWithBlock:^id(BFTask *task) {
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

    return tcs.task;
}

@end
