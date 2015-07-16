//
//  CUTETicketEditingListener.m
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicketEditingListener.h"
#import "CUTETicket.h"

@interface CUTETicketEditingListener () {


}

@end


@implementation CUTETicketEditingListener

+ (CUTETicketEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    CUTETicketEditingListener *listener = [CUTETicketEditingListener new];
    [listener startListenMarkWithSayer:sayer];
    return listener;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _propertyListener = [CUTEModelEditingListener new];
    }
    return self;
}


- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    [super startListenMarkWithSayer:sayer];
    [_propertyListener startListenMarkWithSayer:[(CUTETicket *)sayer property]];
}

- (void)stopListenMark {
    [super stopListenMark];
    [_propertyListener stopListenMark];
}

@end
