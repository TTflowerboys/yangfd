//
//  CUTERentTicketEditor.m
//  currant
//
//  Created by Foster Yin on 12/12/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTERentTicketEditor.h"
#import <Sequencer.h>
#import <BFTask.h>
#import <BFTaskCompletionSource.h>
#import "CUTECommonMacro.h"
#import "CUTEAPIManager.h"

@interface CUTERentTicketEditor () {

    CUTEAPIManager *_apiManager;

}

@end

@implementation CUTERentTicketEditor

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
    }
    return self;
}



- (NSDictionary *)validatePropertyParams:(NSDictionary *)propertyParams {
    NSMutableDictionary *retPropertyParams = [NSMutableDictionary dictionaryWithDictionary:propertyParams];

    //validate latitude and longitude
    if (propertyParams[@"latitude"] && !propertyParams[@"longitude"]) {
        [retPropertyParams removeObjectForKey:@"latitude"];
        [retPropertyParams removeObjectForKey:@"longitude"];
    }
    else if (!propertyParams[@"latitude"] && propertyParams[@"longitude"]) {
        [retPropertyParams removeObjectForKey:@"latitude"];
        [retPropertyParams removeObjectForKey:@"longitude"];
    }
    else if (propertyParams[@"latitude"] && propertyParams[@"longitude"]) {
        CLLocation *location = [[CLLocation alloc] initWithLatitude:[propertyParams[@"latitude"] doubleValue] longitude:[propertyParams[@"longitude"] doubleValue]];
        if (!location) {
            [retPropertyParams removeObjectForKey:@"latitude"];
            [retPropertyParams removeObjectForKey:@"longitude"];
        }
    }
    return retPropertyParams;
}

- (BFTask *)editTicketWithTicket:(CUTETicket *)ticket ticketParams:(NSDictionary *)ticketParams
propertyParams:(NSDictionary *)propertyParams {

    if (_apiManager == nil) {
        // the editing use seperate queue, the queue only perform one request for one time, may need one queuer for per ticket, buy now no need, just a shared queue is ok
        _apiManager = [CUTEAPIManager new];
        _apiManager.backingManager.operationQueue.maxConcurrentOperationCount = 1;
    }

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];
    __block CUTEProperty *retProperty = ticket.property;
    propertyParams = [self validatePropertyParams:propertyParams];

    if (propertyParams && propertyParams.count > 0) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            NSAssert(ticket.property, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
            NSAssert(ticket.property.identifier, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
            [[_apiManager POST:CONCAT(@"/api/2/property/", ticket.property.identifier, @"/edit") parameters:propertyParams resultClass:[CUTEProperty class]] continueWithBlock:^id(BFTask *task) {
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
                    CUTEProperty *property = task.result;
                    retProperty = property;
                    completion(property);
                }
                return task;
            }];
        }];
    }
    else {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            completion(ticket.property);
        }];
    }

    if (ticketParams && ticketParams.count > 0) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            NSAssert(ticket.identifier, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");

            [[_apiManager POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:ticketParams resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
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
                    CUTETicket *ticket = task.result;
                    ticket.property = retProperty;
                    [tcs setResult:ticket];
                }
                return nil;
            }];
        }];
    }
    else {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            CUTETicket *retTicket = [ticket copy];
            retTicket.property = result;
            [tcs setResult:retTicket];
        }];
    }

    [sequencer run];
    return tcs.task;
}


@end
